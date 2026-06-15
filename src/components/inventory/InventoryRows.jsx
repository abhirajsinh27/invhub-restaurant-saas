import React from "react";
import StatusBadge from "../shared/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function InventoryRows({
  categoryProducts,
  updateQty,
  restockInput,
  setRestockInput,
  handleRestock,
  handleUseStock,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {categoryProducts.map((product) => (
        <tr
          key={product._id}
          className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
        >
          <td className="px-6 py-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{product.supplier}</p>
            </div>
          </td>
          <td className="px-6 py-4">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{product.qty} {product.unit || "pcs"}</p>
          </td>
          <td className="px-6 py-4">
            <p className="text-slate-900 dark:text-slate-100 text-sm">₹{product.price}</p>
          </td>
          <td className="px-6 py-4">
            <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
              ₹{(product.price * product.qty).toLocaleString()}
            </p>
          </td>
          <td className="px-6 py-4">
            <StatusBadge qty={product.qty} minStock={product.minStock} />
          </td>
          <td className="px-6 py-4">
            {user?.role === "admin" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(product._id, -1)}
                  disabled={product.qty === 0}
                  className="w-7 h-7 rounded bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-955/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm"
                >
                  −
                </button>
                <span className="w-16 text-center font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {product.qty} {product.unit || "pcs"}
                </span>
                <button
                  onClick={() => updateQty(product._id, 1)}
                  className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-955/40 flex items-center justify-center font-bold text-sm"
                >
                  +
                </button>

                <div className="border-l border-slate-200 dark:border-slate-800 pl-3 ml-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={restockInput[product._id] || ""}
                    onChange={(e) =>
                      setRestockInput({
                        ...restockInput,
                        [product._id]: e.target.value,
                      })
                    }
                    className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleRestock(product._id)}
                    className="px-2.5 py-1 bg-purple-650 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUseStock(product)}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                >
                  Use Stock
                </button>

                <button
                  onClick={() =>
                    navigate("/requests", {
                      state: {
                        prefilledProductId: product._id,
                      },
                    })
                  }
                  className="px-3 py-1.5 bg-purple-650 text-white text-xs font-semibold rounded hover:bg-purple-700 transition-colors"
                >
                  Request Restock
                </button>
              </div>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

export default InventoryRows;
