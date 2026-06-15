const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Activity = require("./models/Activity");
const User = require("./models/User");
const Request = require("./models/Request");
const Organization = require("./models/Organization");
const Notification = require("./models/Notification");
const InventoryMovement = require("./models/InventoryMovement");
const auth = require("./middleware/auth");
const requireAdmin = require("./middleware/requireAdmin");

const notifyAdmins = (organizationId, type, message) => {
  return User.find({ organizationId, role: "admin" })
    .then((admins) => {
      const notifications = admins.map((admin) => ({
        organizationId,
        userId: admin._id,
        type,
        message,
        read: false,
      }));
      if (notifications.length > 0) {
        return Notification.insertMany(notifications);
      }
    })
    .catch((err) => console.error("Error creating notifications for admins:", err));
};

const checkAndCreateStockNotifications = (product, organizationId) => {
  const qty = Number(product.qty);
  const minStock = Number(product.minStock);
  const unit = product.unit || "pcs";

  if (qty === 0) {
    Notification.findOne({
      organizationId,
      type: "critical_stock",
      message: new RegExp(`${product.name}.*out of stock`, "i"),
      read: false
    }).then((exists) => {
      if (!exists) {
        notifyAdmins(organizationId, "critical_stock", `Critical Alert: ${product.name} is completely out of stock!`);
      }
    });
  } else if (qty <= minStock * 0.5) {
    Notification.findOne({
      organizationId,
      type: "critical_stock",
      message: new RegExp(`${product.name}.*extremely low`, "i"),
      read: false
    }).then((exists) => {
      if (!exists) {
        notifyAdmins(organizationId, "critical_stock", `Critical Alert: ${product.name} is extremely low on stock (${qty} ${unit}).`);
      }
    });
  } else if (qty <= minStock) {
    Notification.findOne({
      organizationId,
      type: "low_stock",
      message: new RegExp(`${product.name}.*low on stock`, "i"),
      read: false
    }).then((exists) => {
      if (!exists) {
        notifyAdmins(organizationId, "low_stock", `Low Stock Warning: ${product.name} is low on stock (${qty} ${unit}).`);
      }
    });
  }
};

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.post("/register", (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    organizationName,
    organizationCode,
  } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      if (role === "staff") {
        if (!organizationCode) {
          return res.status(400).json({
            message:
              "Organization Join Code is required for staff registration.",
          });
        }

        Organization.findOne({ organizationCode })
          .then((org) => {
            if (!org) {
              return res.status(400).json({
                message:
                  "Invalid Organization Join Code. Please request a valid code from your Admin.",
              });
            }

            bcrypt
              .hash(password, 10)
              .then((hashedPassword) => {
                return User.create({
                  fullName,
                  email,
                  password: hashedPassword,
                  role: "staff",
                  organizationId: org._id,
                });
              })
              .then((user) => {
                org.members.push(user._id);
                org.save().then(() => {
                  Activity.create({
                    type: "create",
                    action: "staff joined",
                    message: `${user.fullName} joined the organization.`,
                    userId: user._id,
                    organizationId: org._id,
                  }).catch((err) => console.error(err));

                  res.status(201).json({
                    message: "User registered successfully",
                  });
                });
              });
          })
          .catch((err) => res.status(500).json({ message: err.message }));
      } else {
        if (!organizationName) {
          return res.status(400).json({
            message: "Organization Name is required for admin registration.",
          });
        }

        bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            return User.create({
              fullName,
              email,
              password: hashedPassword,
              role: "admin",
            });
          })
          .then((user) => {
            const randomCode =
              "INV-" + Math.floor(10000 + Math.random() * 90000);

            Organization.create({
              name: organizationName,
              ownerId: user._id,
              organizationCode: randomCode,
              members: [user._id],
            })
              .then((org) => {
                user.organizationId = org._id;
                user.save().then(() => {
                  Activity.create({
                    type: "create",
                    action: "organization created",
                    message: `${user.fullName} created organization: ${org.name}.`,
                    userId: user._id,
                    organizationId: org._id,
                  }).catch((err) => console.error(err));

                  res.status(201).json({
                    message: "User and Organization registered successfully",
                  });
                });
              })
              .catch((err) => {
                User.findByIdAndDelete(user._id).exec();
                res.status(500).json({
                  message: "Error creating organization: " + err.message,
                });
              });
          })
          .catch((err) => res.status(500).json({ message: err.message }));
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          message: "Invalid email or password",
        });
      }
      bcrypt.compare(password, user.password).then(async (isMatch) => {
        if (!isMatch) {
          return res.status(400).json({
            message: "Invalid email or password",
          });
        }

        let organizationId = user.organizationId;
        if (!organizationId) {
          try {
            const code = "INV-" + Math.floor(10000 + Math.random() * 90000);
            const defaultOrg = await Organization.create({
              name: `${user.fullName}'s Workspace`,
              ownerId: user._id,
              organizationCode: code,
              members: [user._id],
            });
            user.organizationId = defaultOrg._id;
            await user.save();
            organizationId = defaultOrg._id;
          } catch (err) {
            console.error("Failed to generate fallback organization:", err);
          }
        }

        const token = jwt.sign(
          {
            userId: user._id,
            role: user.role,
            organizationId: organizationId,
          },
          process.env.JWT_SECRET,
          { expiresIn: "3d" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // Set to true in production with HTTPS
          sameSite: "lax",
          maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        res.json({
          message: "Login successful",
          user: {
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            organizationId: organizationId,
          },
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

app.get("/me", auth, (req, res) => {
  User.findById(req.user.userId)
    .select("-password")
    .populate("organizationId")
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Logged out successfully",
  });
});

app.get("/me/summary", auth, async (req, res) => {
  try {
    const requestsCreated = await Request.countDocuments({
      requestedBy: req.user.userId,
    });
    const actionsPerformed = await Activity.countDocuments({
      userId: req.user.userId,
    });
    const productsManaged = await Product.countDocuments({
      organizationId: req.user.organizationId,
    });
    res.json({
      requestsCreated,
      actionsPerformed,
      productsManaged,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res, next) => {
  res.send("Welcome to the Inventory Management API");
  next();
});

app.get("/activities", auth, (req, res) => {
  Activity.find({ UserId: req.user.userId })
    .sort({ timestamp: -1 })
    .then((activities) => {
      res.json(activities);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error fetching activities",
        details: err.message,
      });
    });
});

// Seed Realistic Restaurant Products
app.post("/products/seed", auth, async (req, res) => {
  try {
    const existingCount = await Product.countDocuments({ organizationId: req.user.organizationId });
    if (existingCount > 0) {
      return res.status(400).json({ message: "Catalog is not empty. Seeding is only allowed on empty catalogs." });
    }

    const seedProductsList = [
      { name: "Tomato", price: 40, qty: 20, minStock: 10, category: "Vegetables", supplier: "Local Vegetable Vendor", unit: "KG" },
      { name: "Onion", price: 30, qty: 25, minStock: 15, category: "Vegetables", supplier: "Local Vegetable Vendor", unit: "KG" },
      { name: "Paneer", price: 350, qty: 8, minStock: 5, category: "Dairy", supplier: "Amul Distributor", unit: "KG" },
      { name: "Cheese", price: 450, qty: 6, minStock: 5, category: "Dairy", supplier: "Amul Distributor", unit: "KG" },
      { name: "Milk", price: 60, qty: 30, minStock: 15, category: "Dairy", supplier: "Amul Distributor", unit: "Liter" },
      { name: "Butter", price: 50, qty: 15, minStock: 8, category: "Dairy", supplier: "Amul Distributor", unit: "Packet" },
      { name: "Cooking Oil", price: 150, qty: 12, minStock: 5, category: "Dairy", supplier: "Metro Wholesale", unit: "Liter" },
      { name: "Coke", price: 40, qty: 48, minStock: 20, category: "Beverage", supplier: "Coca-Cola Distributor", unit: "Bottle" },
      { name: "Rice", price: 80, qty: 50, minStock: 10, category: "Snacks", supplier: "Metro Wholesale", unit: "KG" },
      { name: "Chicken", price: 220, qty: 15, minStock: 8, category: "Frozen", supplier: "Fresh Farm Suppliers", unit: "KG" },
      { name: "Spices", price: 100, qty: 20, minStock: 5, category: "Sauces", supplier: "Metro Wholesale", unit: "Packet" }
    ];

    const seedProducts = seedProductsList.map((p, idx) => {
      const codes = { Dairy: "DAI", Beverage: "BEV", Frozen: "FRZ", Vegetables: "VEG", Bakery: "BAK", Sauces: "SAU", Snacks: "SNK" };
      const code = codes[p.category] || "GEN";
      const randomNum = 100 + idx + Math.floor(Math.random() * 800);
      return {
        ...p,
        sku: `${code}-${randomNum}`,
        organizationId: req.user.organizationId,
        createdBy: req.user.userId
      };
    });

    const createdProducts = await Product.insertMany(seedProducts);

    await Activity.create({
      UserId: req.user.userId,
      userId: req.user.userId,
      organizationId: req.user.organizationId,
      type: "create",
      action: "product created",
      message: `Manager seeded ${createdProducts.length} realistic restaurant food items into the catalog.`,
    });

    res.status(201).json(createdProducts);
  } catch (err) {
    res.status(500).json({ message: "Failed to seed: " + err.message });
  }
});

// Get All Products (tenant isolated)
app.get("/products", auth, (req, res) => {
  Product.find({ organizationId: req.user.organizationId })
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error fetching products",
        details: err.message,
      });
    });
});

// Create a New Product (tenant isolated)
app.post("/products", auth, requireAdmin, (req, res) => {
  Product.create({
    ...req.body,
    organizationId: req.user.organizationId,
    createdBy: req.user.userId,
  })
    .then((product) => {
      Activity.create({
        UserId: req.user.userId,
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        type: "create",
        action: "product created",
        message: `Product created: ${product.name}`,
        relatedProduct: product._id,
      })
        .then(() => {
          res.status(201).json(product);
        })
        .catch((err) => {
          console.error("Error creating activity log:", err);
          res.status(201).json(product);
        });
    })
    .catch((error) => {
      res.status(500).json({
        message: error.message,
      });
    });
});

app.delete("/products/:id", auth, requireAdmin, (req, res) => {
  Product.findOneAndDelete({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      Activity.create({
        UserId: req.user.userId,
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        type: "delete",
        action: "product deleted",
        message: `Product deleted: ${deletedProduct.name}`,
        relatedProduct: deletedProduct._id,
      })
        .then(() => {
          res.json({ message: "Product deleted successfully" });
        })
        .catch((err) => {
          console.error("Error creating activity log:", err);
          res.json({
            message: "Product deleted successfully",
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error deleting product",
        details: err.message,
      });
    });
});

app.delete("/products", auth, requireAdmin, (req, res) => {
  Product.deleteMany({ organizationId: req.user.organizationId })
    .then(() => {
      Activity.create({
        UserId: req.user.userId,
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        type: "delete",
        action: "all products cleared",
        message: "All products have been deleted",
      })
        .then(() => {
          res.json({ message: "All products deleted successfully" });
        })
        .catch((err) => {
          console.error("Error creating activity log:", err);
          res.json({ message: "All products deleted successfully" });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error deleting products",
        details: err.message,
      });
    });
});

//Use Product
app.put("/products/:id/use", auth, (req, res) => {
  const { usedQty, reason } = req.body;

  if (!usedQty || usedQty <= 0) {
    return res.status(400).json({
      message: "Valid used quantity required",
    });
  }
  Product.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      if (product.qty < usedQty) {
        return res.status(400).json({
          message: "Not enough stock available",
        });
      }
      product.qty -= Number(usedQty);

      product.save().then((updatedProduct) => {
        checkAndCreateStockNotifications(updatedProduct, req.user.organizationId);

        let moveType = "used";
        if (reason && reason.toLowerCase().includes("waste")) {
          moveType = "waste";
        }

        InventoryMovement.create({
          productId: product._id,
          organizationId: req.user.organizationId,
          userId: req.user.userId,
          type: moveType,
          quantity: Number(usedQty),
          reason: reason || "Daily Cooking",
        }).catch((err) => {
          console.error("Inventory movement error:", err);
        });

        const unit = product.unit || "pcs";
        let actionVerb = "Used";
        if (reason) {
          const lowerReason = reason.toLowerCase();
          if (lowerReason.startsWith("waste")) actionVerb = "Waste";
          else if (lowerReason.startsWith("damaged")) actionVerb = "Damaged";
          else if (lowerReason.startsWith("expired")) actionVerb = "Expired";
          else if (lowerReason.startsWith("staff consumption")) actionVerb = "Staff Consumption";
        }

        const msg = `${actionVerb} ${usedQty} ${unit} ${product.name}`;

        Activity.create({
          type: "inventory used",
          action: "stock used",
          message: msg,
          userId: req.user.userId,
          UserId: req.user.userId,
          organizationId: req.user.organizationId,
          relatedProduct: product._id,
        }).catch((err) => {
          console.error("Activity error:", err);
        });
        res.json(updatedProduct);
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

app.put("/products/:id", auth, requireAdmin, (req, res) => {
  Product.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((oldProduct) => {
      if (!oldProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      const changes = [];

      if (Number(oldProduct.price) !== Number(req.body.price)) {
        changes.push(`price from ₹${oldProduct.price} to ₹${req.body.price}`);
      }
      if (Number(oldProduct.qty) !== Number(req.body.qty)) {
        changes.push(`quantity from ${oldProduct.qty} to ${req.body.qty}`);
      }
      const message =
        changes.length > 0
          ? `Updated ${oldProduct.name}: ${changes.join(", ")}`
          : `Updated ${oldProduct.name}`;
      const activityType =
        Number(oldProduct.qty) !== Number(req.body.qty)
          ? "inventory adjusted"
          : "update";
      const activityAction =
        Number(oldProduct.qty) !== Number(req.body.qty)
          ? "inventory adjusted"
          : "product updated";
      Product.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.user.organizationId },
        req.body,
        { new: true },
      )
        .then((updatedProduct) => {
          if (updatedProduct) {
            checkAndCreateStockNotifications(updatedProduct, req.user.organizationId);
          }
          Activity.create({
            UserId: req.user.userId,
            userId: req.user.userId,
            organizationId: req.user.organizationId,
            type: activityType,
            action: activityAction,
            message,
            relatedProduct: updatedProduct._id,
          })
            .then(() => {
              res.json(updatedProduct);
            })
            .catch((err) => {
              console.error("Error creating activity log:", err);
              res.json(updatedProduct);
            });
        })
        .catch((err) => {
          res.status(500).json({
            error: "Error updating product",
            details: err.message,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error finding product",
        details: err.message,
      });
    });
});

// Create Request (tenant isolated)
app.post("/requests", auth, (req, res) => {
  const { productId, requestedQty, reason } = req.body;

  if (!productId || requestedQty === undefined) {
    return res
      .status(400)
      .json({ message: "Product ID and requested quantity are required" });
  }

  Product.findOne({ _id: productId, organizationId: req.user.organizationId })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      User.findById(req.user.userId)
        .then((user) => {
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          Request.create({
            productId: product._id,
            productName: product.name,
            currentQty: product.qty,
            requestedQty: Number(requestedQty),
            reason: reason || "",
            requestedBy: user._id,
            requesterName: user.fullName,
            organizationId: req.user.organizationId,
            unit: product.unit || "pcs",
          })
            .then((request) => {
              const unitStr = product.unit || "pcs";
              Activity.create({
                UserId: req.user.userId,
                userId: req.user.userId,
                organizationId: req.user.organizationId,
                type: "request created",
                action: "request created",
                message: `Request created: ${user.fullName} requested stock of ${product.name} to be ${requestedQty} ${unitStr} (Current: ${product.qty} ${unitStr})`,
                relatedProduct: product._id,
              }).catch((err) =>
                console.error("Error creating activity log:", err),
              );

              // Create notification for all admins in the organization
              User.find({
                organizationId: req.user.organizationId,
                role: "admin",
              }).then((admins) => {
                const notifications = admins.map((admin) => ({
                  organizationId: req.user.organizationId,
                  userId: admin._id,
                  type: "request_submitted",
                  message: `New stock request submitted for ${product.name} (Qty: ${requestedQty} ${unitStr}) by ${user.fullName}.`,
                }));
                if (notifications.length > 0) {
                  Notification.insertMany(notifications).catch((err) =>
                    console.error(err),
                  );
                }
              });

              res.status(201).json(request);
            })
            .catch((err) => {
              res.status(500).json({ message: err.message });
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// Get Requests (tenant isolated)
app.get("/requests", auth, (req, res) => {
  let query = { organizationId: req.user.organizationId };
  if (req.user.role !== "admin") {
    query.requestedBy = req.user.userId;
  }

  Request.find(query)
    .sort({ createdAt: -1 })
    .then((requests) => {
      res.json(requests);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error fetching requests", details: err.message });
    });
});

// Approve Request (Admin only, tenant isolated)
app.put("/requests/:id/approve", auth, requireAdmin, (req, res) => {
  Request.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((request) => {
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: `Request is already ${request.status}` });
      }

      request.status = "approved";
      request
        .save()
        .then((updatedRequest) => {
          Product.findOne({
            _id: request.productId,
            organizationId: req.user.organizationId,
          })
            .then((product) => {
              if (!product) {
                console.error(
                  `Product ${request.productId} not found during approval`,
                );
                return res.json(updatedRequest);
              }

              product.qty = request.requestedQty;
              product
                .save()
                .then(() => {
                  checkAndCreateStockNotifications(product, req.user.organizationId);
                  Activity.create({
                    UserId: req.user.userId,
                    userId: req.user.userId,
                    organizationId: req.user.organizationId,
                    type: "request approved",
                    action: "request approved",
                    message: `Request approved: ${request.productName} quantity updated to ${request.requestedQty} (Requested by: ${request.requesterName})`,
                    relatedProduct: product._id,
                  })
                    .then(() => {
                      // Create notification for requester
                      Notification.create({
                        organizationId: req.user.organizationId,
                        userId: request.requestedBy,
                        type: "request_approved",
                        message: `Your request for ${request.productName} (Qty: ${request.requestedQty}) has been approved.`,
                      }).catch((err) => console.error(err));

                      res.json(updatedRequest);
                    })
                    .catch((err) => {
                      console.error("Error creating activity log:", err);
                      res.json(updatedRequest);
                    });
                })
                .catch((err) => {
                  res.status(500).json({
                    message: "Error updating product inventory",
                    details: err.message,
                  });
                });
            })
            .catch((err) => {
              res.status(500).json({
                message: "Error finding product",
                details: err.message,
              });
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// Reject Request (Admin only, tenant isolated)
app.put("/requests/:id/reject", auth, requireAdmin, (req, res) => {
  Request.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId,
  })
    .then((request) => {
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: `Request is already ${request.status}` });
      }

      request.status = "rejected";
      request
        .save()
        .then((updatedRequest) => {
          Activity.create({
            UserId: req.user.userId,
            userId: req.user.userId,
            organizationId: req.user.organizationId,
            type: "request rejected",
            action: "request rejected",
            message: `Request rejected: ${request.productName} (Requested: ${request.requestedQty}, By: ${request.requesterName})`,
            relatedProduct: request.productId,
          })
            .then(() => {
              // Create notification for requester
              Notification.create({
                organizationId: req.user.organizationId,
                userId: request.requestedBy,
                type: "request_rejected",
                message: `Your request for ${request.productName} (Qty: ${request.requestedQty}) has been rejected.`,
              }).catch((err) => console.error(err));

              res.json(updatedRequest);
            })
            .catch((err) => {
              console.error("Error creating activity log:", err);
              res.json(updatedRequest);
            });
        })
        .catch((err) => {
          res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// GET /activities (tenant isolated)
app.get("/activities", auth, (req, res) => {
  Activity.find({ organizationId: req.user.organizationId })
    .sort({ timestamp: -1 })
    .then((activities) => {
      res.json(activities);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error fetching activities",
        details: err.message,
      });
    });
});

// STAFF MANAGEMENT APIS

// Get members
app.get("/organizations/members", auth, requireAdmin, (req, res) => {
  Organization.findOne({ _id: req.user.organizationId })
    .then((org) => {
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      User.find({ organizationId: org._id })
        .select("-password")
        .then((members) => {
          res.json({
            organizationCode: org.organizationCode,
            organizationName: org.name,
            members,
          });
        })
        .catch((err) => res.status(500).json({ message: err.message }));
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

// Update member role
app.put("/organizations/members/:id/role", auth, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!role || !["admin", "staff"].includes(role)) {
    return res.status(400).json({ message: "Invalid role value" });
  }

  if (req.params.id === req.user.userId) {
    return res
      .status(400)
      .json({ message: "You cannot demote or modify your own role." });
  }

  User.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user.organizationId },
    { role },
    { new: true },
  )
    .select("-password")
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found in organization." });
      }

      Activity.create({
        type: "update",
        action: "role updated",
        message: `Role of ${user.fullName} updated to ${role}.`,
        userId: req.user.userId,
        UserId: req.user.userId,
        organizationId: req.user.organizationId,
      }).catch((err) => console.error(err));

      res.json(user);
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

// Remove staff member
app.delete("/organizations/members/:id", auth, requireAdmin, (req, res) => {
  if (req.params.id === req.user.userId) {
    return res.status(400).json({ message: "You cannot remove yourself." });
  }

  User.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user.organizationId },
    { organizationId: null, role: "staff" },
    { new: true },
  )
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found in organization." });
      }

      Organization.findOneAndUpdate(
        { _id: req.user.organizationId },
        { $pull: { members: user._id } },
      ).then(() => {
        Activity.create({
          type: "delete",
          action: "staff removed",
          message: `${user.fullName} was removed from the organization.`,
          userId: req.user.userId,
          UserId: req.user.userId,
          organizationId: req.user.organizationId,
        }).catch((err) => console.error(err));

        res.json({ message: "Staff member removed successfully." });
      });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

// NOTIFICATIONS APIS

// Get user notifications
app.get("/notifications", auth, (req, res) => {
  Notification.find({
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  })
    .sort({ createdAt: -1 })
    .then((notifications) => {
      res.json(notifications);
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

// Mark notification as read
app.put("/notifications/:id/read", auth, (req, res) => {
  Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { read: true },
    { new: true },
  )
    .then((notif) => {
      if (!notif) {
        return res.status(404).json({ message: "Notification not found." });
      }
      res.json(notif);
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

// Mark all as read
app.put("/notifications/read-all", auth, (req, res) => {
  Notification.updateMany(
    { userId: req.user.userId, read: false },
    { read: true },
  )
    .then(() => {
      res.json({ message: "All notifications marked as read." });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.MONGODB_URI;

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:");
    console.error(err);
  });
