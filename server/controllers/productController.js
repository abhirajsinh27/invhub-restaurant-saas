const Product = require("../models/Product");
const Activity = require("../models/Activity");
const InventoryMovement = require("../models/InventoryMovement");
const { checkAndCreateStockNotifications } = require("../services/notificationService");

const seedProducts = async (req, res) => {
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
};

const getProducts = (req, res) => {
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
};

const createProduct = (req, res) => {
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
};

const deleteProduct = (req, res) => {
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
};

const clearProducts = (req, res) => {
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
};

const useProduct = (req, res) => {
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
};

const updateProduct = (req, res) => {
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
};

module.exports = {
  seedProducts,
  getProducts,
  createProduct,
  deleteProduct,
  clearProducts,
  useProduct,
  updateProduct,
};
