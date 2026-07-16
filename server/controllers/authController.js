const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Activity = require("../models/Activity");
const Organization = require("../models/Organization");
const Request = require("../models/Request");
const Product = require("../models/Product");

const register = (req, res) => {
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
};

const login = (req, res) => {
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

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        const fullUser = await User.findById(user._id)
          .populate("organizationId")
          .select("-password");

        res.json({
          message: "Login successful",
          user: fullUser,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
};

const getMe = (req, res) => {
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
};

const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.json({
    message: "Logged out successfully",
  });
};

const getSummary = async (req, res) => {
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
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  getSummary,
};
