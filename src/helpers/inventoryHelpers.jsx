import {AlertCircle, AlertTriangle, CheckCircle} from "lucide-react";

// Get category health status
 export const getCategoryStatus = (categoryProducts) => {
    const outCount = categoryProducts.filter((p) => p.qty === 0).length;

    const criticalCount = categoryProducts.filter(
      (p) => p.qty > 0 && p.qty <= p.minStock * 0.5,
    ).length;

    const lowCount = categoryProducts.filter(
      (p) => p.qty > p.minStock * 0.5 && p.qty <= p.minStock,
    ).length;

    if (outCount > 0) {
      return { status: "critical", label: "Out of Stock" };
    } else if (criticalCount > 0) {
      return { status: "critical", label: "Critical" };
    } else if (lowCount > 0) {
      return { status: "low", label: "Low Stock" };
    } else {
      return { status: "healthy", label: "Healthy" };
    }
  };

  
  // Get category header styling based on status
 export const getCategoryHeaderStyle = (status) => {
    const styles = {
      critical:
        "bg-slate-100 dark:bg-slate-900/40 border-l-4 border-red-500 text-slate-900 dark:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
      low: 
        "bg-slate-100 dark:bg-slate-900/40 border-l-4 border-amber-500 text-slate-900 dark:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
      healthy:
        "bg-slate-100 dark:bg-slate-900/40 border-l-4 border-emerald-500 text-slate-900 dark:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50",
    };
    return styles[status] || styles.healthy;
  };

  // Get badge color based on status
 export const getStatusBadgeColor = (status) => {
    const colors = {
      critical: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30",
      low: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
      healthy: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
    };
    return colors[status] || colors.healthy;
  };

  // Get icon based on status
 export const getStatusIcon = (status) => {
    switch (status) {
      case "critical":
        return <AlertCircle size={18} className="text-red-500 dark:text-red-400" />;
      case "low":
        return <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />;
      default:
        return <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />;
    }
  };
