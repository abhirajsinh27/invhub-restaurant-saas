const User = require("../models/User");
const Notification = require("../models/Notification");

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

module.exports = {
  notifyAdmins,
  checkAndCreateStockNotifications
};
