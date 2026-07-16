const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/notifications", auth, notificationController.getNotifications);
router.put("/notifications/:id/read", auth, notificationController.markAsRead);
router.put("/notifications/read-all", auth, notificationController.markAllAsRead);

module.exports = router;
