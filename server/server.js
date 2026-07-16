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

const { notifyAdmins, checkAndCreateStockNotifications } = require("./services/notificationService");

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./routes/authRoutes"));

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

app.use("/", require("./routes/productRoutes"));

app.use("/", require("./routes/requestRoutes"));

app.use("/", require("./routes/activityRoutes"));

// STAFF MANAGEMENT APIS

app.use("/", require("./routes/organizationRoutes"));

app.use("/", require("./routes/notificationRoutes"));

if (!process.env.MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

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
