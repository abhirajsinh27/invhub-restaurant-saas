import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, AlertCircle, CheckCircle } from "lucide-react";
import { categories,categoryCodes } from "../data/categories";
import { API_URL } from "../config";

function AddProduct({ setProducts,fetchActivities}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    sku: "",
    price: "",
    qty: "",
    category: "",
    supplier: "",
    minStock: "",
    unit: "pcs",
    createdAt: "",
    updatedAt: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
 

  const generateSKU = (category) => {
    const code = categoryCodes[category] || "GEN";
    const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit random number
    return `${code}-${randomNum}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = { ...formData, [name]: value };

    // Auto generate SKU when category changes
    if (name === "category") {
      updatedData.sku = generateSKU(value);
    }

    setFormData(updatedData);
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }
    if (formData.qty === "" || formData.qty < 0) {
      newErrors.qty = "Quantity cannot be negative";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = "Supplier is required";
    }
    if (formData.minStock === "" || formData.minStock < 0) {
      newErrors.minStock = "Minimum stock cannot be negative";
    }

    return newErrors;
  };

  const handleAddProduct = () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: formData.name,
      sku: formData.sku,
      price: Number(formData.price),
      category: formData.category,
      qty: Number(formData.qty),
      supplier: formData.supplier,
      minStock: Number(formData.minStock),
      unit: formData.unit,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    };

    setError(null);
    setSuccess(false);

    fetch(`${API_URL}/products`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to add product.");
        }
        return data;
      })
      .then((createdProduct) => {
        setProducts((prev) => [...prev, createdProduct]);
        fetchActivities();
        setSuccess(true);

        setTimeout(() => {
          navigate("/products");
        }, 1500);
      })
      .catch((err) => {
        console.error("Error adding product:", err);
        setError(err.message || "Failed to add product. Please verify your data and try again.");
      });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-8 rounded-xl">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-8 select-none">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-955/50 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-900/50">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Add New Product
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Fill in the details below to add a new product
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50/50 dark:bg-green-955/20 border border-green-200 dark:border-green-900/30 rounded-xl flex items-center gap-3 animate-slideIn">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
              Product added successfully! Redirecting...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 animate-slideIn">
            <AlertCircle className="text-red-650 dark:text-red-400" size={20} />
            <p className="text-red-700 dark:text-red-400 font-semibold text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProduct();
          }}
          className="space-y-5"
        >
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-colors ${
                errors.name
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:ring-purple-500/20 focus:border-purple-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 cursor-pointer transition-colors ${
                errors.category
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:ring-purple-500/20 focus:border-purple-500"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.category}
              </p>
            )}
          </div>

          {/* Measurement Unit */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Measurement Unit *
            </label>
            <select
              name="unit"
              value={formData.unit}
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

          {/* SKU (read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              readOnly
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400 select-all"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              SKU is automatically generated based on the category
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-colors ${
                errors.price
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:ring-purple-500/20 focus:border-purple-500"
              }`}
            />
            {errors.price && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.price}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Quantity *
            </label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              placeholder="Enter quantity"
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-colors ${
                errors.qty
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:ring-purple-500/20 focus:border-purple-500"
              }`}
            />
            {errors.qty && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.qty}
              </p>
            )}
          </div>

          {/* Minimum Stock */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Minimum Stock *
            </label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              placeholder="Enter minimum stock"
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-colors ${
                errors.minStock
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:ring-purple-500/20 focus:border-purple-500"
              }`}
            />
            {errors.minStock && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.minStock}
              </p>
            )}
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Supplier *
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Enter supplier"
              className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-colors ${
                errors.supplier
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-700 focus:ring-purple-500/20 focus:border-purple-500"
              }`}
            />
            {errors.supplier && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.supplier}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 select-none">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold text-sm cursor-pointer"
            >
              Add Product
            </button>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition font-semibold text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
