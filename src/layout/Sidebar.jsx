import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Utensils,
  TrendingUp,
  Zap,
  ClipboardList,
  Users,
  Bell,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "staff"],
    },
    {
      path: "/products",
      label: "Products",
      icon: Package,
      roles: ["admin"],
    },
    {
      path: "/inventory",
      label: "Inventory",
      icon: Utensils,
      roles: ["admin", "staff"],
    },
    {
      path: "/requests",
      label: "Requests",
      icon: ClipboardList,
      roles: ["admin", "staff"],
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: TrendingUp,
      roles: ["admin"],
    },
    {
      path: "/staff",
      label: "Staff Management",
      icon: Users,
      roles: ["admin"],
    },
    {
      path: "/profile",
      label: "Profile",
      icon: User,
      roles: ["staff"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );
  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-45 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 p-5 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-900/50">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              InvHub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col space-y-1 flex-1 -mx-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-150 rounded-md ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                  }
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
            Modern Inventory System
          </p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
