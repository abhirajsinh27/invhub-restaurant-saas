const Notification = require("../models/Notification");

const getNotifications = (req, res) => {
  Notification.find({
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  })
    .sort({ createdAt: -1 })
    .then((notifications) => {
      res.json(notifications);
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

const markAsRead = (req, res) => {
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
};

const markAllAsRead = (req, res) => {
  Notification.updateMany(
    { userId: req.user.userId, read: false },
    { read: true },
  )
    .then(() => {
      res.json({ message: "All notifications marked as read." });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
