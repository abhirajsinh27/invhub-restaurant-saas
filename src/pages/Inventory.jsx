import StatCard from "../components/shared/StatCard";
import StatusBadge from "../components/shared/StatusBadge";
import CategorySection from "../components/inventory/CategorySection";
import { useState, useMemo } from "react";
import { Search, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { API_URL } from "../config";
import toast from "react-hot-toast";

import {
  getCategoryStatus,
  getCategoryHeaderStyle,
  getStatusBadgeColor,
  getStatusIcon,
} from "../helpers/inventoryHelpers";
import UseStockModal from "../components/inventory/UseStockModal";

function Inventory({
  products,
  setProducts,
  fetchActivities,
  loadingProducts,
  error,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [restockInput, setRestockInput] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))].filter(Boolean);
    return cats.sort();
  }, [products]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.qty, 0);
    const totalQty = products.reduce((sum, p) => sum + p.qty, 0);
    const lowStockCount = products.filter(
      (p) => p.qty > 0 && p.qty <= p.minStock,
    ).length;
    const outOfStock = products.filter((p) => p.qty === 0).length;

    return {
      totalProducts,
      totalValue,
      totalQty,
      lowStockCount,
      outOfStock,
    };
  }, [products]);

  // Get critical and low stock products
  const criticalProducts = useMemo(
    () =>
      products
        .filter((p) => p.qty <= p.minStock * 0.5)
        .sort((a, b) => a.qty - b.qty),
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.qty <= p.minStock),
    [products],
  );

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Group filtered products by category
  const groupedByCategory = useMemo(() => {
    const grouped = {};
    filteredProducts.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredProducts]);

  // Update quantity
  const updateQty = (id, amount) => {
    const product = products.find((p) => p._id === id);

    if (!product) return;

    const newQty = Math.max(0, product.qty + amount);

    fetch(`${API_URL}/products/${id}`, {
      credentials: "include",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...product,
        qty: newQty,
      }),
    })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? updatedProduct : p)),
        );
        fetchActivities(); // Fetch updated activity logs
      })
      .catch((err) => {
        console.error("Error updating quantity:", err);
      });
  };

  // Handle restock
  const handleRestock = (id) => {
    const amount = Number(restockInput[id] || 0);
    if (amount <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    updateQty(id, amount);
    setRestockInput({ ...restockInput, [id]: "" });
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleUseStock = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="select-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Inventory Operations
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track stock levels, record usage, and trigger restocking requests
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 animate-slideIn">
          <AlertCircle className="flex-shrink-0" size={18} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {loadingProducts ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">
            Loading inventory products...
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              type="total"
            />
            <StatCard
              title="Total Inventory Value"
              value={`₹${stats.totalValue.toLocaleString()}`}
              type="Inventoryvalue"
            />
            <StatCard
              title="Total Units in Stock"
              value={stats.totalQty}
              type="total"
            />
            <StatCard
              title="Low/Out of Stock"
              value={stats.lowStockCount + stats.outOfStock}
              type="critical"
            />
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search
                  className="text-slate-400 dark:text-slate-500"
                  size={16}
                />
              </span>
              <input
                type="text"
                placeholder="Search products or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-550 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products by Category */}
          <div className="space-y-4">
            {groupedByCategory.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No products found matching your search
                </p>
              </div>
            ) : (
              <CategorySection
                groupedByCategory={groupedByCategory}
                expandedCategory={expandedCategory}
                toggleCategory={toggleCategory}
                getCategoryStatus={getCategoryStatus}
                getCategoryHeaderStyle={getCategoryHeaderStyle}
                getStatusBadgeColor={getStatusBadgeColor}
                getStatusIcon={getStatusIcon}
                updateQty={updateQty}
                restockInput={restockInput}
                setRestockInput={setRestockInput}
                handleRestock={handleRestock}
                handleUseStock={handleUseStock}
              />
            )}
          </div>
        </>
      )}

      {/* Use Stock Operational Modal */}
      {isModalOpen && selectedProduct && (
        <UseStockModal
          isOpen={isModalOpen}
          product={selectedProduct}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={(updatedProduct) => {
            setProducts((prev) =>
              prev.map((p) =>
                p._id === updatedProduct._id ? updatedProduct : p,
              ),
            );
            fetchActivities();
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default Inventory;
