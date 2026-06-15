const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 5 },
  category: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  supplier: { type: String, required: true },
  unit: { type: String, default: "pcs" },

  UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);