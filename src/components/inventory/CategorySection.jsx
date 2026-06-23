import React from "react";
import StatusBadge from "../shared/StatusBadge";
import StatCard from "../shared/StatCard";
import { ChevronDown } from "lucide-react";
import InventoryRows from "./InventoryRows";

function CategorySection({
  groupedByCategory,
  expandedCategory,
  toggleCategory,
  getCategoryStatus,
  getCategoryHeaderStyle,
  getStatusBadgeColor,
  getStatusIcon,
  updateQty,
  restockInput,
  setRestockInput,
  handleRestock,
  handleUseStock,
}) {
  return groupedByCategory.map(([category, categoryProducts]) => {
    const categoryStatus = getCategoryStatus(categoryProducts);
    const headerStyle = getCategoryHeaderStyle(categoryStatus.status);
    const badgeColor = getStatusBadgeColor(categoryStatus.status);

    return (
      <div
        key={category}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
      >
        {/* Category Header with Color Coding */}
        <button
          onClick={() => toggleCategory(category)}
          className={`w-full px-6 py-4.5 ${headerStyle} flex items-center justify-between font-semibold transition-all`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              {getStatusIcon(categoryStatus.status)}
              <span className="text-base font-bold">{category}</span>
            </div>
            <div className="flex items-center gap-2 select-none">
              <span
                className={`${badgeColor} text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1`}
              >
                {categoryProducts.length} items
              </span>
              <span
                className={`${badgeColor} text-xs font-semibold px-2 py-0.5 rounded-md`}
              >
                {categoryStatus.label}
              </span>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`transition-transform text-slate-500 dark:text-slate-400 ${expandedCategory === category ? "rotate-180" : ""}`}
          />
        </button>

        {/* Category Content */}
        {expandedCategory === category && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <InventoryRows
                  categoryProducts={categoryProducts}
                  updateQty={updateQty}
                  restockInput={restockInput}
                  setRestockInput={setRestockInput}
                  handleRestock={handleRestock}
                  handleUseStock={handleUseStock}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  });
}

export default CategorySection;
