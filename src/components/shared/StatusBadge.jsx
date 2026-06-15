import React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

function StatusBadge({ qty, minStock }) {
  const quantity = Number(qty);
  const minimum = Number(minStock);

  if (quantity === 0) {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <XCircle size={14} className="text-red-600 dark:text-red-400" />
        <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-md border border-red-100 dark:border-red-950/50">
          Out of Stock
        </span>
      </div>
    );
  } else if (quantity <= minimum * 0.5) {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <AlertCircle size={14} className="text-orange-600 dark:text-orange-450" />
        <span className="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-md border border-orange-100 dark:border-orange-955/50">
          Critical Stock
        </span>
      </div>
    );
  } else if (quantity <= minimum) {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <AlertCircle size={14} className="text-amber-600 dark:text-amber-450" />
        <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-md border border-amber-100 dark:border-amber-955/50">
          Low Stock
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-md border border-emerald-100 dark:border-emerald-955/50">
          In Stock
        </span>
      </div>
    );
  }
}

export default StatusBadge;