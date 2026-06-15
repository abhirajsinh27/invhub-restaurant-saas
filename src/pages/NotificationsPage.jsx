import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Loader2
} from "lucide-react";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    fetch("http://localhost:3000/notifications", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load notifications");
        return res.json();
      })
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleMarkAsRead = (id) => {
    fetch(`http://localhost:3000/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to mark as read");
        return res.json();
      })
      .then((updatedNotif) => {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? updatedNotif : n))
        );
      })
      .catch((err) => console.error(err));
  };

  const handleMarkAllRead = () => {
    if (notifications.filter((n) => !n.read).length === 0) return;

    fetch("http://localhost:3000/notifications/read-all", {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to mark all as read");
        return res.json();
      })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch((err) => console.error(err));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "request_approved":
        return (
          <div className="p-2.5 bg-green-100 dark:bg-green-950/40 rounded-lg text-green-600 dark:text-green-400 flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
        );
      case "request_rejected":
        return (
          <div className="p-2.5 bg-red-100 dark:bg-red-955/40 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0">
            <XCircle size={18} />
          </div>
        );
      default:
        return (
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Bell size={18} />
          </div>
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3.5 select-none">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-900/50">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Stay updated on approvals, adjustments, and system status
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">Checking for updates...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Inbox className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600 mb-3.5" />
          <p className="text-slate-700 dark:text-slate-300 text-lg font-semibold">Inbox is empty</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            You don't have any notifications or warnings at this time.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 rounded-xl overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start justify-between gap-4 p-5 transition duration-200 ${
                !notif.read ? "bg-slate-50 dark:bg-slate-800/40" : "bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                {getNotificationIcon(notif.type)}
                <div className="space-y-1">
                  <p
                    className={`text-sm leading-relaxed ${
                      !notif.read ? "font-semibold text-slate-900 dark:text-slate-100" : "font-medium text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(notif.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
