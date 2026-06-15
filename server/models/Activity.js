const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    action: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model("Activity", activitySchema);