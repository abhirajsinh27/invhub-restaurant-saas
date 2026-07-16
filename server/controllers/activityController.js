const Activity = require("../models/Activity");

const getActivities = (req, res) => {
  const query = req.user.role === "admin"
    ? { organizationId: req.user.organizationId }
    : { UserId: req.user.userId };

  Activity.find(query)
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
};

module.exports = {
  getActivities,
};
