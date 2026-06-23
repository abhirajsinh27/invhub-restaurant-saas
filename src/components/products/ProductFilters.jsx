import React from "react";
import { Filter, Search } from "lucide-react";

function ProductFilters({
  setFilterStatus,
  categories,
  setFilterCategory,
  filterStatus,
  filterCategory,
  searchItem,
  setSearchItem,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="text-slate-400 dark:text-slate-500" size={16} />
        </span>
        <input
          type="text"
          placeholder="Search products..."
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ProductFilters;
