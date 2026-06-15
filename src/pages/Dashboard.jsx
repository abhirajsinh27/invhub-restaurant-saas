import React, { useState, useEffect } from "react";
import StatCard from "../components/shared/StatCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TrendingDown,
  AlertCircle,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Package,
  Activity,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

function Dashboard({ products, activityLogs }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/requests", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load requests");
        return res.json();
      })
      .then((data) => {
        setRequests(data);
        setLoadingRequests(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingRequests(false);
      });
  }, []);

  // Generic metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.qty > 0 && p.qty <= p.minStock,
  );
  const lowStockCount = lowStockProducts.length;
  const outOfStockProducts = products.filter((p) => p.qty === 0);
  const outOfStockCount = outOfStockProducts.length;

  const totalValue = products.reduce(
    (total, p) => total + Number(p.qty) * Number(p.price),
    0,
  );

  // Request counts
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  const activityStyles = {
    create: {
      border: "border-green-200 dark:border-green-900/30",
      bg: "bg-green-50/50 dark:bg-green-900/20",
      iconBg: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400",
      icon: "✓",
    },
    add: {
      border: "border-blue-200 dark:border-blue-900/30",
      bg: "bg-blue-50/50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      icon: "+",
    },
    update: {
      border: "border-yellow-200 dark:border-yellow-900/30",
      bg: "bg-yellow-50/50 dark:bg-yellow-900/20",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
      iconColor: "text-amber-600 dark:text-amber-450",
      icon: "✎",
    },
    delete: {
      border: "border-red-200 dark:border-red-900/30",
      bg: "bg-red-50/50 dark:bg-red-900/20",
      iconBg: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-450",
      icon: "×",
    },
    "request created": {
      border: "border-blue-200 dark:border-blue-900/30",
      bg: "bg-blue-50/30 dark:bg-blue-900/10",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-500 dark:text-blue-400",
      icon: "📥",
    },
    "request approved": {
      border: "border-emerald-200 dark:border-emerald-900/30",
      bg: "bg-emerald-50/30 dark:bg-emerald-900/10",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      icon: "✅",
    },
    "request rejected": {
      border: "border-rose-200 dark:border-rose-900/30",
      bg: "bg-rose-50/30 dark:bg-rose-900/10",
      iconBg: "bg-rose-100 dark:bg-rose-900/40",
      iconColor: "text-rose-600 dark:text-rose-400",
      icon: "❌",
    },
    "inventory adjusted": {
      border: "border-purple-200 dark:border-purple-900/30",
      bg: "bg-purple-50/30 dark:bg-purple-900/10",
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
      icon: "🔄",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 select-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-405">
          Welcome back,{" "}
          <strong className="text-slate-900 dark:text-white font-semibold">
            {user?.fullName}
          </strong>
          . Here's your operational overview.
        </p>
      </div>

      {user?.role === "admin" ? (
        /* ==================== ADMIN DASHBOARD ==================== */
        <div className="space-y-8 animate-slideIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={totalProducts}
              type="total"
              icon="Package"
            />
            <StatCard
              title="Inventory Value"
              value={`₹${totalValue.toLocaleString()}`}
              type="value"
              icon="DollarSign"
            />
            <StatCard
              title="Low Stock Items"
              value={lowStockCount}
              type="warning"
              icon="AlertTriangle"
            />
            <StatCard
              title="Pending Approvals"
              value={pendingRequests.length}
              type="critical"
              icon="Clock"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Manager Actions
                </h2>
                <div className="space-y-3">
                  <div
                    onClick={() => navigate("/requests")}
                    className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Review Requests
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {pendingRequests.length} pending decisions
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:translate-x-1 transition"
                    />
                  </div>

                  <div
                    onClick={() => navigate("/staff")}
                    className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Manage Staff
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Invite and promote members
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:translate-x-1 transition"
                    />
                  </div>

                  <div
                    onClick={() => navigate("/products")}
                    className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Add Products
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Configure catalog inventory
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 group-hover:translate-x-1 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Alerts Panel */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={18} />{" "}
                  Critical Alerts
                </h2>
                {outOfStockCount === 0 && lowStockCount === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    ✅ All stock levels healthy.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {outOfStockProducts.map((p) => (
                      <div
                        key={p._id}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-lg flex justify-between items-center"
                      >
                        <span>
                          <strong>{p.name}</strong> is completely out of stock!
                        </span>
                        <span className="font-bold">0 {p.unit || "pcs"}</span>
                      </div>
                    ))}
                    {lowStockProducts.map((p) => (
                      <div
                        key={p._id}
                        className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-lg flex justify-between items-center"
                      >
                        <span>
                          <strong>{p.name}</strong> is low on stock.
                        </span>
                        <span className="font-bold">
                          {p.qty} {p.unit || "pcs"} / {p.minStock}{" "}
                          {p.unit || "pcs"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Global Organization Activity Feed */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity
                    className="text-purple-650 dark:text-purple-400"
                    size={18}
                  />{" "}
                  Organization Activity Log
                </h2>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {activityLogs.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
                      No recent team activities recorded.
                    </p>
                  ) : (
                    activityLogs.map((activity) => (
                      <div
                        key={activity._id}
                        className={`flex items-start gap-4 p-3 border-l-4 border-y border-r border-slate-200 dark:border-slate-700 ${
                          activityStyles[activity.action || activity.type]
                            ?.border || "border-slate-300 dark:border-slate-700"
                        } ${activityStyles[activity.action || activity.type]?.bg || "bg-slate-50 dark:bg-slate-900"} rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition duration-150`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`flex items-center justify-center h-7 w-7 rounded-md ${
                              activityStyles[activity.action || activity.type]
                                ?.iconBg || "bg-slate-200 dark:bg-slate-800"
                            }`}
                          >
                            <span
                              className={`text-sm font-bold ${
                                activityStyles[activity.action || activity.type]
                                  ?.iconColor ||
                                "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {activityStyles[activity.action || activity.type]
                                ?.icon || "?"}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            {activity.message}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(
                              activity.timestamp || activity.createdAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== STAFF DASHBOARD ==================== */
        <div className="space-y-8 animate-slideIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="My Proposed Adjustments"
              value={requests.length}
              type="total"
              icon="Package"
            />
            <StatCard
              title="Pending Requests"
              value={pendingRequests.length}
              type="warning"
              icon="Clock"
            />
            <StatCard
              title="Approved Requests"
              value={approvedRequests.length}
              type="total"
              icon="CheckCircle2"
            />
            <StatCard
              title="Rejected Requests"
              value={rejectedRequests.length}
              type="critical"
              icon="XCircle"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low Stock Adjustments Widget */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={18} /> Stock
                  Warnings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Adjustments are required for these products. Propose a restock
                  target below.
                </p>

                {lowStockCount === 0 && outOfStockCount === 0 ? (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center">
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                      Stock level healthy
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {[...outOfStockProducts, ...lowStockProducts]
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p._id}
                          className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-900 transition duration-150"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              Current Qty: {p.qty} {p.unit || "pcs"}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate("/requests", {
                                state: { prefilledProductId: p._id },
                              })
                            }
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold rounded-md transition shadow-sm cursor-pointer"
                          >
                            Propose
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Staff's Own Request Tracker */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-center mb-4 select-none">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList
                      className="text-blue-600 dark:text-blue-400"
                      size={18}
                    />{" "}
                    My Recent Requests
                  </h2>
                  <button
                    onClick={() => navigate("/requests")}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    View All <ArrowRight size={12} />
                  </button>
                </div>

                {requests.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
                    You haven't submitted any restock requests yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Product</th>
                          <th className="px-4 py-2.5 text-center">
                            Target Qty
                          </th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Submitted Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.slice(0, 5).map((req) => (
                          <tr
                            key={req._id}
                            className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition duration-150"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                              {req.productName}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                              {req.requestedQty} {req.unit || "pcs"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-md ${
                                  req.status === "approved"
                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                                    : req.status === "rejected"
                                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                                }`}
                              >
                                {req.status.charAt(0).toUpperCase() +
                                  req.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
