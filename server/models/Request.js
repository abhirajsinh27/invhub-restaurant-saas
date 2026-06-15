const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  currentQty: {
    type: Number,
    required: true
  },
  requestedQty: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);
