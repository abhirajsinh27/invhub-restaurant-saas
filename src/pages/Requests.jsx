import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config";
import toast from "react-hot-toast";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Loader2,
  User,
  History,
  AlertCircle,
  Plus,
  Search,
} from "lucide-react";

function Requests({ products, setProducts }) {
  const { user } = useAuth();
  const location = useLocation();
  const prefilledProductId = location.state?.prefilledProductId;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(
    prefilledProductId || "",
  );
  const [requestedQty, setRequestedQty] = useState("");
  const [reason, setReason] = useState("");

  // Admin Tab State ('pending' or 'history')
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    fetch(`${API_URL}/requests`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requests");
        return res.json();
      })
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Please select a product.");
      return;
    }
    if (requestedQty === "" || Number(requestedQty) < 0) {
      toast.error("Please enter a valid non-negative quantity.");
      return;
    }

    setSubmitting(true);
    fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: selectedProductId,
        requestedQty: Number(requestedQty),
        reason,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit request");
        return res.json();
      })
      .then((newRequest) => {
        setRequests((prev) => [newRequest, ...prev]);
        setSelectedProductId("");
        setRequestedQty("");
        setReason("");
        setSubmitting(false);
        toast.success("Request submitted successfully!");
      })
      .catch((err) => {
        toast.error("Error: " + err.message);
        setSubmitting(false);
      });
  };

  const handleApprove = (id) => {
    if (!window.confirm("Are you sure you want to APPROVE this request?"))
      return;

    fetch(`${API_URL}/requests/${id}/approve`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Approval failed");
        return res.json();
      })
      .then((updatedReq) => {
        setRequests((prev) => prev.map((r) => (r._id === id ? updatedReq : r)));
        // Propagate stock update to parent products state instantly
        setProducts((prev) =>
          prev.map((p) =>
            p._id === updatedReq.productId
              ? { ...p, qty: updatedReq.requestedQty }
              : p,
          ),
        );
        toast.success("Request approved and inventory updated!");
      })
      .catch((err) => toast.error("Error: " + err.message));
  };

  const handleReject = (id) => {
    if (!window.confirm("Are you sure you want to REJECT this request?"))
      return;

    fetch(`${API_URL}/requests/${id}/reject`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Rejection failed");
        return res.json();
      })
      .then((updatedReq) => {
        setRequests((prev) => prev.map((r) => (r._id === id ? updatedReq : r)));
        toast.success("Request rejected.");
      })
      .catch((err) => toast.error("Error: " + err.message));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-md">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-md">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-md animate-pulse">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  // Find current selected product's stock info
  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // Apply search query filtering
  const filtered = requests.filter((req) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.productName.toLowerCase().includes(q) ||
      req.requesterName.toLowerCase().includes(q) ||
      (req.reason && req.reason.toLowerCase().includes(q))
    );
  });

  // Filter requests
  const pendingRequests = filtered.filter((r) => r.status === "pending");
  const historicalRequests = filtered.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 select-none">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-900/50">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Request Workflow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === "admin"
              ? "Review and approve stock adjustments submitted by staff"
              : "Submit and monitor requests for inventory adjustments"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">
            Fetching workflow requests...
          </p>
        </div>
      ) : user?.role === "admin" ? (
        /* ==================== ADMIN EXPERIENCE ==================== */
        <div className="space-y-6">
          {/* Tab Selector & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === "pending"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                }`}
              >
                <Clock size={15} />
                Pending Review
                {pendingRequests.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 bg-purple-600 text-white dark:bg-purple-600 text-xs font-bold rounded-md">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === "history"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                }`}
              >
                <History size={15} />
                Request History
                {historicalRequests.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-md">
                    {historicalRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search inputs */}
            <div className="relative w-full md:max-w-xs pb-2 md:pb-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search
                  className="text-slate-400 dark:text-slate-500"
                  size={14}
                />
              </span>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
              />
            </div>
          </div>

          {activeTab === "pending" ? (
            /* Pending List */
            pendingRequests.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="mx-auto w-12 h-12 text-green-400 dark:text-green-500 mb-3" />
                <p className="text-slate-800 dark:text-slate-200 text-base font-semibold">
                  All caught up!
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  No pending stock adjustments require review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {req.productName}
                        </h3>
                        <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-md flex items-center gap-1 select-none">
                          <User size={10} /> Requested by: {req.requesterName}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span>
                          Current Stock:{" "}
                          <strong className="text-slate-900 dark:text-slate-200 font-semibold">
                            {req.currentQty} {req.unit || "pcs"}
                          </strong>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">
                          |
                        </span>
                        <span>
                          Requested target:{" "}
                          <strong className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                            {req.requestedQty} {req.unit || "pcs"}
                          </strong>
                        </span>
                      </p>
                      {req.reason && (
                        <p className="text-xs bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 italic">
                          " {req.reason} "
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Submitted: {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : /* History List */
          historicalRequests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <History className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                No past requests recorded
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Requester
                      </th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Qty (Old → New)
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Processed Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                          {req.productName}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {req.requesterName}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 text-sm">
                          {req.currentQty} {req.unit || "pcs"} →{" "}
                          <strong className="text-slate-900 dark:text-white font-bold">
                            {req.requestedQty} {req.unit || "pcs"}
                          </strong>
                        </td>
                        <td
                          className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm italic max-w-xs truncate"
                          title={req.reason}
                        >
                          {req.reason || "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-xs">
                          {new Date(
                            req.updatedAt || req.createdAt,
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== STAFF EXPERIENCE ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 select-none">
                <Plus
                  size={18}
                  className="text-purple-600 dark:text-purple-400"
                />{" "}
                Propose Adjustment
              </h2>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Select Product */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Product *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition"
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Current: {p.qty} {p.unit || "pcs"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show current qty if selected */}
                {selectedProduct && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-lg flex items-center justify-between select-none">
                    <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-wide">
                      Current Quantity
                    </span>
                    <span className="text-base font-bold text-purple-900 dark:text-purple-300">
                      {selectedProduct.qty} {selectedProduct.unit || "pcs"}
                    </span>
                  </div>
                )}

                {/* Target Qty */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Requested Target Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition"
                    required
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Enter the total final quantity desired in stock.
                  </p>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Reason for Adjustment
                  </label>
                  <textarea
                    placeholder="e.g. Restock for upcoming weekend rush"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm text-sm cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 select-none">
                <History
                  size={18}
                  className="text-purple-600 dark:text-purple-400"
                />{" "}
                My Requested Adjustments
              </h2>

              {requests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <AlertCircle className="mx-auto w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-sm">
                    No requests submitted yet
                  </p>
                  <p className="text-xs mt-1">
                    Select a product on the left to request your first stock
                    check update.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Old → New
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr
                          key={req._id}
                          className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                            {req.productName}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 text-xs">
                            {req.currentQty} {req.unit || "pcs"} →{" "}
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {req.requestedQty} {req.unit || "pcs"}
                            </strong>
                          </td>
                          <td
                            className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs italic max-w-[150px] truncate"
                            title={req.reason}
                          >
                            {req.reason || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(req.status)}
                          </td>
                          <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs">
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
      )}
    </div>
  );
}

export default Requests;
