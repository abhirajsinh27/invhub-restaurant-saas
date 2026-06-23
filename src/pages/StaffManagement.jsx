import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import toast from "react-hot-toast";
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Shield,
  Trash2,
  Calendar,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";

function StaffManagement() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    setLoading(true);
    fetch(`${API_URL}/organizations/members`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load organization members");
        return res.json();
      })
      .then((data) => {
        setMembers(data.members || []);
        setJoinCode(data.organizationCode || "");
        setOrgName(data.organizationName || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRole = (memberId, currentRole) => {
    const newRole = currentRole === "admin" ? "staff" : "admin";
    if (
      !window.confirm(
        `Are you sure you want to change this member's role to ${newRole.toUpperCase()}?`,
      )
    )
      return;

    fetch(`${API_URL}/organizations/members/${memberId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update member role");
        return res.json();
      })
      .then(() => {
        toast.success("Member role updated successfully!");
        fetchMembers();
      })
      .catch((err) => toast.error("Error: " + err.message));
  };

  const handleRemoveMember = (memberId, memberName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName} from the organization? They will lose all access to inventory data.`,
      )
    )
      return;

    fetch(`${API_URL}/organizations/members/${memberId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove member");
        return res.json();
      })
      .then(() => {
        toast.success("Member removed successfully.");
        fetchMembers();
      })
      .catch((err) => toast.error("Error: " + err.message));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8 select-none">
        <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-900/50">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your organization members, invite new staff, and adjust roles
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">
            Loading organization workspace...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Join Code Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {orgName || "Organization Workspace"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 uppercase tracking-wide font-bold">
                SaaS Tenant Workspace
              </p>

              {/* Code display */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                    Staff Join Code
                  </span>
                  <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <code className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                      {joinCode}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 cursor-pointer"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start text-xs text-slate-500 dark:text-slate-400 leading-relaxed select-none">
                  <AlertCircle
                    size={16}
                    className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5"
                  />
                  <p>
                    Share this code with your staff. They can enter it during
                    registration to automatically join this workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6 select-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Workspace Members ({members.length})
                </h3>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="font-semibold text-sm">No members found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Joined Date
                        </th>
                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr
                          key={member._id}
                          className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {member.fullName}
                                {member._id === currentUser?.userId && (
                                  <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded-md">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail size={12} /> {member.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                member.role === "admin"
                                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30"
                                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                              }`}
                            >
                              <Shield size={12} />
                              {member.role === "admin" ? "Admin" : "Staff"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 text-xs">
                              <Calendar size={13} />
                              {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              {member._id !== currentUser?.userId ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUpdateRole(member._id, member.role)
                                    }
                                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-700 dark:text-slate-355 hover:text-purple-650 dark:hover:text-purple-400 rounded-md text-xs font-bold transition cursor-pointer"
                                    title="Toggle Role"
                                  >
                                    Promote/Demote
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRemoveMember(
                                        member._id,
                                        member.fullName,
                                      )
                                    }
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-slate-400 hover:text-red-600 transition cursor-pointer"
                                    title="Remove from Workspace"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                  None
                                </span>
                              )}
                            </div>
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

export default StaffManagement;
