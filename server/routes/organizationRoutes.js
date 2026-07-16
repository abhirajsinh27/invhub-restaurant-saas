const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/organizations/members", auth, requireAdmin, organizationController.getMembers);
router.put("/organizations/members/:id/role", auth, requireAdmin, organizationController.updateMemberRole);
router.delete("/organizations/members/:id", auth, requireAdmin, organizationController.removeMember);

module.exports = router;
