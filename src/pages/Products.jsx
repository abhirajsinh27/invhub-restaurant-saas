import { Pencil, Trash2, Plus, Filter, X, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import toast from "react-hot-toast";
import StatusBadge from "../components/shared/StatusBadge";
import ProductRows from "../components/products/ProductRows";
import ProductFilters from "../components/products/ProductFilters";
import EditProductPanel from "../components/products/EditProductPanel";
import { getProductStatus, validateProduct } from "../helpers/productHelpers";

function Products({ products, setProducts, fetchActivities, loadingProducts, error }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    price: "",
    qty: "",
    category: "",
    supplier: "",
    sku: "",
    minStock: "",
    unit: "pcs",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      name: product.name,
      price: product.price,
      qty: product.qty,
      category: product.category,
      supplier: product.supplier,
      sku: product.sku,
      minStock: product.minStock,
      unit: product.unit || "pcs",
    });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const validate = validateProduct(editData);
    if (!validate.valid) {
      toast.error(validate.message);
      return;
    }
    fetch(`${API_URL}/products/${editingId}`, {
      credentials: "include",
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? updatedProduct : p)),
        );
        fetchActivities();
        setEditingId(null);
        toast.success("Product updated successfully");
      })
      .catch(() => toast.error("Failed to update item. Please try again."));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const productToDelete = products.find((p) => p._id === id);

      fetch(`${API_URL}/products/${id}`, {
        credentials: "include",
        method: "DELETE",
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return null;
          }

          return data;
        })
        .then((data) => {
          if (!data) return;

          const updated = products.filter((item) => item._id !== id);

          fetchActivities();
          setProducts(updated);
          toast.success("Product deleted successfully");
        })
        .catch(() => toast.error("Failed to delete item. Please try again."));
    }
  };

  const handleClearAll = () => {
    if (products.length === 0) {
      toast.error("No items to clear");
      return;
    }
    if (
      window.confirm(
        "Are you sure you want to delete ALL items? This cannot be undone.",
      )
    ) {
      fetch(`${API_URL}/products`, {
        credentials: "include",
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Admin access required to clear all items");
          }
          return res.json();
        })
        .then(() => {
          fetchActivities();
          setProducts([]);
          toast.success("Catalog cleared successfully");
        })
        .catch((err) => toast.error(err.message));
    }
  };

  const handleSeedData = () => {
    if (
      window.confirm(
        "Do you want to seed realistic restaurant products (Tomato, Milk, Chicken, etc.)?",
      )
    ) {
      fetch(`${API_URL}/products/seed`, {
        method: "POST",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok)
            throw new Error("Seeding failed or catalog is not empty.");
          return res.json();
        })
        .then((data) => {
          setProducts(data);
          fetchActivities();
          toast.success("Demo catalog seeded successfully");
        })
        .catch((err) => toast.error("Error: " + err.message));
    }
  };

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchItem.toLowerCase());

    const status = getProductStatus(product);

    const matchesStatus = filterStatus === "all" || status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Catalog Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing {filteredProducts.length} of {products.length} cataloged
            products
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {user.role === "admin" && (
            <button
              onClick={() => navigate("/products/add")}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg transition shadow-sm font-semibold text-sm cursor-pointer"
            >
              <Plus size={16} />
              Add Product
            </button>
          )}
          {user.role === "admin" && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg transition font-semibold text-sm cursor-pointer"
            >
              <Trash2 size={16} />
              Clear Catalog
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 animate-slideIn">
          <AlertCircle className="flex-shrink-0" size={18} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {loadingProducts ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-10 h-10 text-purple-650 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">
            Loading products catalog...
          </p>
        </div>
      ) : (
        <>
          {/* Filter Section */}
          <ProductFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            categories={categories}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            searchItem={searchItem}
            setSearchItem={setSearchItem}
          />

      {/* Table */}
      {filteredProducts.length === 0 ? (
        products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-205 dark:border-slate-800 max-w-xl mx-auto p-8 mt-6 select-none">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Products in Catalog
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Your restaurant's food inventory catalog is empty. Populate it
              manually by adding products, or seed it with realistic restaurant
              data.
            </p>
            <div className="flex gap-4 justify-center">
              {user.role === "admin" && (
                <button
                  onClick={handleSeedData}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition cursor-pointer text-sm"
                >
                  Seed Restaurant Demo Data
                </button>
              )}
              {user.role === "admin" && (
                <button
                  onClick={() => navigate("/products/add")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition cursor-pointer text-sm"
                >
                  Add Product
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto p-8 mt-6 select-none">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <X size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No Results Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We couldn't find any items matching your search criteria. Try
              modifying your query or category filters.
            </p>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Min Stock
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  {user.role === "admin" && (
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <ProductRows
                  filteredProducts={filteredProducts}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* Overlay */}
      {editingId && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setEditingId(null)}
        />
      )}

      {/* Side Panel  */}
      <EditProductPanel
        editingId={editingId}
        editData={editData}
        handleChange={handleChange}
        handleSave={handleSave}
        setEditingId={setEditingId}
      />
    </div>
  );
}

export default Products;
