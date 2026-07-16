const Organization = require("../models/Organization");
const User = require("../models/User");
const Activity = require("../models/Activity");

const getMembers = (req, res) => {
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
};

const updateMemberRole = (req, res) => {
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
};

const removeMember = (req, res) => {
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
};

module.exports = {
  getMembers,
  updateMemberRole,
  removeMember,
};
