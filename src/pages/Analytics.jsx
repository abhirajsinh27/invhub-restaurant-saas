import React, { useState } from "react";
import StatCard from "../components/shared/StatCard";
import StatusBadge from "../components/shared/StatusBadge";
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";

function Analytics({ products }) {
  // Calculate Analytics Metrics
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (total, product) => total + Number(product.qty) * Number(product.price),
    0,
  );
  const lowStock = products.filter(
    (product) => product.qty > 0 && product.qty <= product.minStock,
  ).length;
  const outOfStock = products.filter((product) => product.qty === 0).length;
  const inStock = products.filter(
    (product) => product.qty >= product.minStock,
  ).length;

  // Calculate Average Price
  const avgPrice =
    products.length > 0
      ? (
          products.reduce((sum, p) => sum + Number(p.price), 0) /
          products.length
        ).toFixed(2)
      : 0;

  // Calculate Total Quantity
  const totalQty = products.reduce((sum, p) => sum + Number(p.qty), 0);

  // Average Stock Level
  const avgStockLevel =
    products.length > 0 ? (totalQty / products.length).toFixed(1) : 0;

  // Top Products by Value
  const topProductsByValue = [...products]
    .sort(
      (a, b) =>
        Number(b.qty) * Number(b.price) - Number(a.qty) * Number(a.price),
    )
    .slice(0, 4);

  // Top Products by Quantity
  const topProductsByQty = [...products]
    .sort((a, b) => Number(b.qty) - Number(a.qty))
    .slice(0, 4);

  // Calculate Stock Health Percentage
  const stockHealth =
    products.length > 0 ? ((inStock / products.length) * 100).toFixed(1) : 0;

  // Low value products (below 100 rupees)
  const lowPriceProducts = products.filter((p) => Number(p.price) < 100).length;

  // High value products (above 1000 rupees)
  const highPriceProducts = products.filter(
    (p) => Number(p.price) > 1000,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 select-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Comprehensive insights into your inventory performance and trends.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={totalProducts}
          type="total"
          icon="Package"
        />
        <StatCard
          title="Total Value"
          value={`₹${totalValue.toLocaleString()}`}
          type="value"
          icon="DollarSign"
        />
        <StatCard
          title="Average Price"
          value={`₹${avgPrice}`}
          type="total"
          icon="DollarSign"
        />
        <StatCard
          title="Total Units"
          value={totalQty}
          type="total"
          icon="Package"
        />
      </div>

      {/* Stock Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4 select-none">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              In Stock
            </h3>
            <div className="p-2 bg-green-50 dark:bg-green-955/30 text-green-600 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/30">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-450 mb-1">
            {inStock}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Products with healthy inventory levels
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4 select-none">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Low Stock
            </h3>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-955/30 text-yellow-600 dark:text-yellow-400 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              <TrendingDown size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-605 dark:text-amber-400 mb-1">
            {lowStock}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Products needing restocking soon
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4 select-none">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Out of Stock
            </h3>
            <div className="p-2 bg-red-50 dark:bg-red-955/30 text-red-650 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
              <PieChart size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-450 mb-1">
            {outOfStock}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Products needing immediate reordering
          </p>
        </div>
      </div>

      {/* Stock Health & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Health */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 select-none">
            Stock Health
          </h3>
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 dark:bg-purple-500 h-full transition-all duration-500"
                  style={{ width: `${stockHealth}%` }}
                />
              </div>
            </div>
            <span className="ml-4 text-xl font-bold text-purple-600 dark:text-purple-400">
              {stockHealth}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 select-none">
            {stockHealth >= 75
              ? "✅ Excellent stock levels"
              : stockHealth >= 50
                ? "⚠️ Moderate stock levels"
                : "❌ Critical stock levels"}
          </p>
        </div>

        {/* Price Category Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 select-none">
            Price Category Distribution
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-slate-650 dark:text-slate-400">
                Budget {`< ₹100`}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {lowPriceProducts}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-slate-650 dark:text-slate-400">
                Standard (₹100 - ₹1000)
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {products.length - lowPriceProducts - highPriceProducts}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-slate-650 dark:text-slate-400">
                Premium {`> ₹1000`}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {highPriceProducts}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Value */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 select-none">
              <TrendingUp
                size={16}
                className="text-slate-400 dark:text-slate-500"
              />
              Top Products by Value
            </h3>
          </div>
          {topProductsByValue.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No products available
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProductsByValue.map((product, index) => (
                <div
                  key={product._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-150"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold w-8 h-8 rounded-lg flex items-center justify-center text-xs select-none">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-500 dark:text-slate-500">
                        {product.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-11">
                      ₹{product.price} × {product.qty} units
                    </p>
                  </div>
                  <span className="font-bold text-sm text-slate-500 dark:text-slate-500">
                    ₹
                    {(
                      Number(product.price) * Number(product.qty)
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products by Quantity */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 select-none">
              <BarChart3
                size={16}
                className="text-slate-400 dark:text-slate-500"
              />
              Top Products by Quantity
            </h3>
          </div>
          {topProductsByQty.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No products available
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProductsByQty.map((product, index) => (
                <div
                  key={product._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-150"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold w-8 h-8 rounded-lg flex items-center justify-center text-xs select-none">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-500 dark:text-slate-500">
                        {product.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 ml-11 flex items-center gap-1.5 mt-0.5">
                      Status:{" "}
                      <StatusBadge
                        qty={product.qty}
                        minStock={product.minStock}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-500 dark:text-slate-500">
                    {product.qty} {product.unit || "pcs"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 p-6 select-none">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 select-none">
          Inventory Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              Average Stock Level
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {avgStockLevel}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide font-medium">
              units per product
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              Stock Health Score
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {stockHealth}%
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide font-medium">
              of products healthy
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              Products at Risk
            </p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {lowStock + outOfStock}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide font-medium">
              need attention
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              Inventory Turnover
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-450">
              {products.length > 0
                ? (totalValue / totalProducts / 100).toFixed(1)
                : 0}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide font-medium">
              avg value per item
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
