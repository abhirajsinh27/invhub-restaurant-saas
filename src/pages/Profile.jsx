import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  LogOut,
  Save,
  X,
  Building2,
  ShieldCheck,
  Activity,
  ClipboardList,
  Package,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Profile() {
  const { logout, user } = useAuth();

  // Store user profile data
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "+1 (555) 123-4567",
    location: user?.location || "New York, USA",
    joinDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "January 15, 2024",
    department: user?.role === "admin" ? "Management" : "Kitchen Staff",
    role: user?.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : "Admin",
  });

  // Store edit mode (whether user is editing or just viewing)
  const [isEditing, setIsEditing] = useState(false);

  // Store edited form data temporarily
  const [editFormData, setEditFormData] = useState(formData);

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/me/summary`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch((err) => console.error("Error fetching summary stats:", err));
  }, []);

  // Update form data if user auth profile changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "+1 (555) 123-4567",
        location: user.location || "New York, USA",
        joinDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "January 15, 2024",
        department: user.role === "admin" ? "Management" : "Kitchen Staff",
        role: user.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : "Admin",
      });
    }
  }, [user]);

  // Handle when user clicks "Edit" button
  const handleEditClick = () => {
    setEditFormData(formData); // Load current data into form
    setIsEditing(true); // Show edit form
  };

  // Handle when user clicks "Cancel" button
  const handleCancelEdit = () => {
    setEditFormData(formData); // Reset form to original data
    setIsEditing(false); // Hide edit form
  };

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle save changes
  const handleSaveChanges = () => {
    setFormData(editFormData); // Update main profile data
    setIsEditing(false); // Exit edit mode
    console.log("Profile updated:", editFormData);
    // Later you'll send this to backend: API call here
    user && localStorage.setItem("user", JSON.stringify(editFormData)); // Update user data in localStorage
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // ===== STEP 3: Render Component =====
  return (
    <div className="p-8">
      {/* ===== HEADER SECTION ===== */}
      <div className="mb-8 select-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          My Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ===== LEFT SIDEBAR: Profile Card ===== */}
        <div className="lg:col-span-1">
          {/* Profile Avatar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-805 p-6 sticky top-20">
            {/* Avatar */}
            <div className="flex justify-center mb-6 select-none">
              <div className="w-20 h-20 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {formData.name.charAt(0)}
              </div>
            </div>

            {/* Basic Info */}
            <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-1">
              {formData.name}
            </h2>
            <p className="text-center text-purple-600 dark:text-purple-400 text-sm font-semibold mb-4">
              {formData.role}
            </p>

            {/* Quick Stats */}
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase tracking-wide font-bold">
                  Workspace
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {user?.organizationId?.name || "InvHub Workspace"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase tracking-wide font-bold">
                  Join Code
                </p>
                {user?.role === "admin" ? (
                  <p className="text-base font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {user?.organizationId?.organizationCode || "N/A"}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Admin only
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase tracking-wide font-bold">
                  Member Count
                </p>
                <p className="text-sm font-semibold text-slate-805 dark:text-slate-250">
                  {user?.organizationId?.members?.length || 1} members
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase tracking-wide font-bold">
                  Member Since
                </p>
                <p className="text-sm font-semibold text-slate-805 dark:text-slate-250">
                  {formData.joinDate}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-105 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition font-semibold text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* ===== RIGHT SIDE: Profile Details ===== */}
        <div className="lg:col-span-2">
          {/* INFO CARD - View Mode */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Account Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User
                      className="text-purple-600 dark:text-purple-400"
                      size={18}
                    />{" "}
                    User Information
                  </h3>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-450 border border-purple-100 dark:border-purple-900/30 rounded-lg transition font-semibold text-xs cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Full Name
                    </label>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {formData.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Email Address
                    </label>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {formData.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      System Role
                    </label>
                    <span className="inline-block px-2.5 py-0.5 mt-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 text-xs font-bold rounded-md">
                      {formData.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Department
                    </label>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {formData.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building2
                    className="text-blue-650 dark:text-blue-400"
                    size={18}
                  />{" "}
                  Workspace Organization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Organization Name
                    </label>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {user?.organizationId?.name || "InvHub Workspace"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Join Code
                    </label>
                    {user?.role === "admin" ? (
                      <p className="text-base font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {user?.organizationId?.organizationCode || "N/A"}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Admin only
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Total Members
                    </label>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {user?.organizationId?.members?.length || 1} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Operational Summary Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity
                    className="text-emerald-600 dark:text-emerald-400"
                    size={18}
                  />
                  Operational Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Requests Created */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <ClipboardList size={20} />
                      </div>
                    </div>

                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {summary ? (
                        summary.requestsCreated
                      ) : (
                        <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                      )}
                    </p>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Requests Created
                    </p>
                  </div>

                  {/* Actions Logged */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Activity size={20} />
                      </div>
                    </div>

                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {summary ? (
                        summary.actionsPerformed
                      ) : (
                        <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                      )}
                    </p>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Actions Logged
                    </p>
                  </div>

                  {/* Products Managed */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Package size={20} />
                      </div>
                    </div>

                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {summary ? (
                        summary.productsManaged
                      ) : (
                        <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                      )}
                    </p>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Products Managed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // EDIT FORM - Edit Mode
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
              {/* Edit Form Header */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Edit Your Profile
              </h3>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    placeholder="Enter your location"
                  />
                </div>

                {/* Department Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={editFormData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    placeholder="Enter your department"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                {/* Save Button */}
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold text-sm cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition font-semibold text-sm cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
