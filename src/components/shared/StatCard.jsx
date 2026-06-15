import React from "react";
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

function StatCard({ title, value, type, icon }) {
  const iconMap = {
    Package: Package,
    DollarSign: DollarSign,
    AlertTriangle: AlertTriangle,
    XCircle: XCircle,
    TrendingUp: TrendingUp,
    Activity: Activity,
  };

  const config = {
    total: {
      icon: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20",
    },
    value: {
      icon: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20",
    },
    warning: {
      icon: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20",
    },
    critical: {
      icon: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-450 border border-red-100 dark:border-red-900/20",
    },
  };

  const { icon: iconStyle } = config[type] || config.total;
  const IconComponent = iconMap[icon] || Package;

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${iconStyle}`}>
          <IconComponent size={20} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;