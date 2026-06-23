import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

function ProductRows({ filteredProducts, handleEdit, handleDelete }) {
  const { user } = useAuth();
  return (
    <>
      {filteredProducts.map((product, index) => (
        <tr
          key={product._id}
          className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
        >
          <td className="px-6 py-4">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {product.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SKU: {product.sku}
            </p>
          </td>
          <td className="px-6 py-4">
            <span className="inline-block px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 text-xs font-semibold rounded-md select-none">
              {product.category}
            </span>
          </td>
          <td className="px-6 py-4 text-center">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {product.qty} {product.unit || "pcs"}
            </p>
          </td>
          <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
            {product.minStock} {product.unit || "pcs"}
          </td>
          <td className="px-6 py-4 text-center">
            <StatusBadge qty={product.qty} minStock={product.minStock} />
          </td>
          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 text-sm">
            ₹{product.price}
          </td>
          {user.role === "admin" && (
            <td className="px-6 py-4">
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                  title="Edit item"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

export default ProductRows;
