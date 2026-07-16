const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/requests", auth, requestController.createRequest);
router.get("/requests", auth, requestController.getRequests);
router.put("/requests/:id/approve", auth, requireAdmin, requestController.approveRequest);
router.put("/requests/:id/reject", auth, requireAdmin, requestController.rejectRequest);

module.exports = router;
