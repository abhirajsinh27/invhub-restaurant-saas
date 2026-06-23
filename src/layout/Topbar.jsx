import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  LogOut,
  User,
  Building2,
  Check,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../config";

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Refs for closing on click outside
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Path mapping for Title + Subtitle
  const getRouteInfo = (path) => {
    switch (path) {
      case "/":
        return {
          title: "Operations Dashboard",
          subtitle: "Monitor restaurant inventory operations and activities",
        };
      case "/products":
        return {
          title: "Catalog Management",
          subtitle: "Manage food items, units, pricing, and suppliers",
        };
      case "/products/add":
        return {
          title: "Add Food Item",
          subtitle: "Configure a new product for restaurant stock",
        };
      case "/inventory":
        return {
          title: "Inventory Operations",
          subtitle: "Track operational stock levels and usage reasons",
        };
      case "/requests":
        return {
          title: "Request Workflow",
          subtitle: "Manage inventory approval and restock requests",
        };
      case "/analytics":
        return {
          title: "Analytics & Trends",
          subtitle: "Monitor stock usage patterns and waste reports",
        };
      case "/staff":
        return {
          title: "Staff Management",
          subtitle: "Invite team members and configure roles",
        };
      case "/profile":
        return {
          title: "Account & Workspace",
          subtitle: "Manage your profile details and tenant information",
        };
      case "/notifications":
        return {
          title: "Notifications Center",
          subtitle: "Review all system messages, approvals, and alerts",
        };
      default:
        return {
          title: "InvHub System",
          subtitle: "Restaurant Inventory Operations SaaS",
        };
    }
  };

  const routeInfo = getRouteInfo(location.pathname);

  // Fetch notifications
  const fetchNotifications = () => {
    if (!user) return;
    fetch(`${API_URL}/notifications`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Error loading notifications:", err));
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 15 seconds for live operations
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
          );
        }
      })
      .catch((err) => console.error(err));
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  // Get Notification Styling
  const getNotifDetails = (type) => {
    switch (type) {
      case "request_approved":
        return {
          icon: (
            <CheckCircle2
              size={16}
              className="text-green-600 dark:text-green-400"
            />
          ),
          borderClass: "border-green-500",
          badge:
            "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
        };
      case "request_rejected":
        return {
          icon: (
            <XCircle size={16} className="text-red-650 dark:text-red-400" />
          ),
          borderClass: "border-red-500",
          badge: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-350",
        };
      case "request_submitted":
        return {
          icon: (
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          ),
          borderClass: "border-blue-500",
          badge:
            "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
        };
      case "critical_stock":
        return {
          icon: (
            <AlertCircle size={16} className="text-red-500 dark:text-red-400" />
          ),
          borderClass: "border-orange-600",
          badge:
            "bg-orange-100 dark:bg-orange-900/50 text-orange-850 dark:text-orange-300",
        };
      case "low_stock":
        return {
          icon: (
            <AlertTriangle
              size={16}
              className="text-amber-500 dark:text-amber-400"
            />
          ),
          borderClass: "border-yellow-500",
          badge:
            "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-850 dark:text-yellow-300",
        };
      default:
        return {
          icon: (
            <Bell size={16} className="text-purple-600 dark:text-purple-400" />
          ),
          borderClass: "border-purple-500",
          badge:
            "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
        };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AV";

  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Staff";

  return (
    <div className="flex items-center justify-between h-18 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative z-40 transition-colors duration-300">
      {/* Left: Dynamic Page Title */}
      <div className="flex items-center gap-3 select-none min-w-0">
        <button
          onClick={onMenuClick}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer lg:hidden flex-shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex flex-col min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
            {routeInfo.title}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate hidden sm:inline">
            {routeInfo.subtitle}
          </span>
        </div>
      </div>

      {/* Right: Actions (Theme, Notifications, Profile) */}
      <div className="flex items-center gap-5 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
          title="Toggle UI Theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full transition cursor-pointer relative ${
              showNotifications
                ? "bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400"
                : "text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center bg-red-500 text-[9px] font-bold text-white rounded-full border border-white dark:border-slate-900 shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700 py-1 z-50 animate-slideIn">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-400 text-[10px] font-bold rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Scrollable list */}
              <div className="max-h-76 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
                {recentNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-xs font-medium">
                      No recent notifications
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((notif) => {
                    const details = getNotifDetails(notif.type);
                    return (
                      <div
                        key={notif._id}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/notifications");
                        }}
                        className={`p-3.5 flex items-start gap-3 transition cursor-pointer border-l-2 ${
                          !notif.read
                            ? `bg-slate-50 dark:bg-slate-800 ${details.borderClass}`
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {details.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs leading-relaxed ${!notif.read ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
                          >
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400 rounded transition flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/notifications");
                }}
                className="block text-center py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                View All Notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pr-3.5 transition cursor-pointer group"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-purple-600 dark:bg-purple-500 rounded-full text-white font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col text-left select-none">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {user?.fullName || "Account"}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                {userRole}
              </span>
            </div>
            <ChevronDown
              size={12}
              className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
            />
          </button>

          {/* Profile Dropdown Panel */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-slideIn">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 select-none">
                <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-400 transition"
              >
                <User size={14} /> My Profile
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/profile"); // organization details exist in profile
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-400 transition"
              >
                <Building2 size={14} /> Organization
              </button>

              <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Topbar;
