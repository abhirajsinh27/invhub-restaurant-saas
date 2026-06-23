import React, { useState } from "react";
import { X, AlertCircle, Loader2, ClipboardList } from "lucide-react";
import { API_URL } from "../../config";

function UseStockModal({ isOpen, product, onClose, onSuccess }) {
  const [usedQty, setUsedQty] = useState("");
  const [movementReason, setMovementReason] = useState("Daily Cooking");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [qtyError, setQtyError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleQtyChange = (val) => {
    setUsedQty(val);
    if (val === "") {
      setQtyError(null);
      return;
    }

    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      setQtyError("Quantity must be greater than zero");
    } else if (num > product.qty) {
      setQtyError(
        `Insufficient stock (Max available: ${product.qty} ${product.unit || "pcs"})`,
      );
    } else {
      setQtyError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const qtyNum = Number(usedQty);
    if (!usedQty || isNaN(qtyNum) || qtyNum <= 0) {
      setQtyError("Please enter a valid quantity");
      return;
    }
    if (qtyNum > product.qty) {
      setQtyError(
        `Cannot exceed available stock of ${product.qty} ${product.unit || "pcs"}`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    // Combine usage dropdown and optional notes into the reason sent to backend
    const combinedReason = notes.trim()
      ? `${movementReason}: ${notes.trim()}`
      : movementReason;

    fetch(`${API_URL}/products/${product._id}/use`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usedQty: qtyNum,
        reason: combinedReason,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to update inventory usage");
        }
        return data;
      })
      .then((updatedProduct) => {
        setSubmitting(false);
        onSuccess(updatedProduct);
      })
      .catch((err) => {
        console.error("Error submitting stock usage:", err);
        setError(err.message || "Something went wrong. Please try again.");
        setSubmitting(false);
      });
  };

  const handleCancel = () => {
    setUsedQty("");
    setMovementReason("Daily Cooking");
    setNotes("");
    setError(null);
    setQtyError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Use Inventory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log daily usage or wastage details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Information Section */}
        <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-sm select-none">
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Product
            </p>
            <p
              className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate"
              title={product.name}
            >
              {product.name}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Current Qty
            </p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-base">
              {product.qty} {product.unit || "pcs"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Category
            </p>
            <span className="inline-block px-2 py-0.5 mt-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded border border-blue-100 dark:border-blue-900/30 truncate max-w-full">
              {product.category}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error Alert Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-lg flex items-start gap-2 animate-slideIn">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity Used Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex justify-between items-center">
              <span>
                Quantity Used ({product.unit || "pcs"}){" "}
                <span className="text-red-500">*</span>
              </span>
              {qtyError && (
                <span className="text-xs text-red-600 font-medium normal-case">
                  {qtyError}
                </span>
              )}
            </label>
            <input
              type="number"
              value={usedQty}
              onChange={(e) => handleQtyChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm ${
                qtyError
                  ? "border-red-300 dark:border-red-900/50 focus:ring-red-200/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:border-purple-500"
              }`}
              placeholder="e.g. 5"
              required
              min="1"
              max={product.qty}
              disabled={submitting}
            />
          </div>

          {/* Usage Type Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Usage Type <span className="text-red-500">*</span>
            </label>
            <select
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition"
              required
              disabled={submitting}
            >
              <option value="Daily Cooking">Daily Cooking</option>
              <option value="Waste">Waste</option>
              <option value="Damaged">Damaged</option>
              <option value="Expired">Expired</option>
              <option value="Staff Consumption">Staff Consumption</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Optional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="e.g. Morning kitchen operations"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition"
              disabled={submitting}
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || qtyError || !usedQty}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UseStockModal;
