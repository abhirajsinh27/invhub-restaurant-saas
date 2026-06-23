import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center max-w-sm w-full shadow-lg relative overflow-hidden select-none">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          <div className="w-12 h-12 border-4 border-purple-100 dark:border-purple-900/30 border-t-purple-600 rounded-full animate-spin"></div>
          <h3 className="text-slate-900 dark:text-white font-bold text-base mt-5">Restoring Session</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 text-center leading-relaxed">
            Please wait while we verify your workspace credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;