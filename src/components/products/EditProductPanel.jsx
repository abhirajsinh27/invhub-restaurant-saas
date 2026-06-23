import React from "react";
import { X } from "lucide-react";
import { categories } from "../../data/categories";

function EditProductPanel({
  editingId,
  editData,
  handleChange,
  handleSave,
  setEditingId,
}) {
  return (
    <div
      className={`fixed top-0 right-0 h-screen w-full max-w-md sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
        editingId ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Edit Item
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update product details
          </p>
        </div>
        <button
          onClick={() => setEditingId(null)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Item Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Item Name *
          </label>
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Enter item name"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            SKU (Cannot Change)
          </label>
          <input
            type="text"
            value={editData.sku}
            disabled
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Category *
          </label>
          <select
            name="category"
            value={editData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 cursor-pointer transition-colors"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Unit selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Measurement Unit *
          </label>
          <select
            name="unit"
            value={editData.unit || "pcs"}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 cursor-pointer transition-colors"
          >
            <option value="pcs">Pieces (pcs)</option>
            <option value="KG">Kilograms (KG)</option>
            <option value="Gram">Grams (Gram)</option>
            <option value="Liter">Liters (Liter)</option>
            <option value="ML">Milliliters (ML)</option>
            <option value="Bottle">Bottles (Bottle)</option>
            <option value="Packet">Packets (Packet)</option>
            <option value="Tray">Trays (Tray)</option>
            <option value="Box">Boxes (Box)</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Quantity *
          </label>
          <input
            type="number"
            name="qty"
            value={editData.qty}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="0"
            min="0"
          />
        </div>

        {/* Minimum Stock */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Minimum Stock *
          </label>
          <input
            type="number"
            name="minStock"
            value={editData.minStock}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="0"
            min="0"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={editData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Supplier *
          </label>
          <input
            type="text"
            name="supplier"
            value={editData.supplier}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Enter supplier name"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0 select-none">
        <button
          onClick={() => setEditingId(null)}
          className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-lg transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default EditProductPanel;
