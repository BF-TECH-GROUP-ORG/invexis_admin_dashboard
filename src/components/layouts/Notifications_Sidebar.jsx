"use client";
import { useState, useMemo } from "react";
import {
  X,
  Check,
  CheckCircle,
  Bell,
  Trash2,
  Package,
  AlertTriangle,
  Info,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Get icon background color based on notification type
const getTypeColor = (type) => {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    general: "bg-gray-400",
  };
  return colors[type] || colors.general;
};

// --- MOCK DATA ---
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "order",
    title: "New Order #1023",
    desc: "A new order for $1,200 has been placed by Apple Inc.",
    full: "Order #1023 requires processing. Ordered items: 50x MacBook Pro Stickers. Verify payment and shipping address.",
    time: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    unread: true,
    avatar:
      "https://ui-avatars.com/api/?name=Apple+Inc&background=000&color=fff",
  },
  {
    id: 2,
    type: "system",
    title: "System Update",
    desc: "Scheduled maintenance in 2 hours.",
    full: "The platform will be undergoing scheduled maintenance from 03:00 AM to 04:00 AM UTC. Please save your work.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: true,
    icon: <Info className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 3,
    type: "alert",
    title: "Low Stock Alert",
    desc: "Item 'Wireless Mouse' is running low.",
    full: "Only 5 units of 'Wireless Mouse' remaining in warehouse NYC-1. Please restock immediately to avoid shortages.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    unread: false,
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  },
  {
    id: 4,
    type: "message",
    title: "New Message from John",
    desc: "Hey, can you check the sales report?",
    full: "John Doe sent you a message: 'Hey, I noticed a discrepancy in the Q3 sales report. Can we meet to discuss this?'",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: false,
    avatar:
      "https://ui-avatars.com/api/?name=John+Doe&background=2563EB&color=fff",
  },
  {
    id: 5,
    type: "order",
    title: "Order Delivered",
    desc: "Order #998 has been delivered.",
    full: "Customer confirmed receipt of Order #998. The transaction is now complete.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    unread: true,
    icon: <Package className="w-5 h-5 text-green-500" />,
  },
];

function NotificationSideBar({
  expanded = true,
  isOpen = false,
  onClose = () => {},
<<<<<<< HEAD
  notifications = [],
  onMarkRead = () => {},
  onMarkAll = () => {},
  loading = false,
  unreadCount = 0,
=======
  // Optional: Allow parent to override or we use internal mock if empy
  notifications: propNotifications = [],
>>>>>>> 10c61ac9eef67dfebaa502362d59231ecad47fe9
}) {
  const [internalNotifications, setInternalNotifications] = useState(
    propNotifications.length > 0 ? propNotifications : MOCK_NOTIFICATIONS
  );
  const [activeNotif, setActiveNotif] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

  // --- ACTIONS ---
  const handleMarkAllRead = () => {
    setInternalNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    setInternalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    setInternalNotifications((prev) => prev.filter((n) => n.id !== id));
    if (activeNotif?.id === id) setActiveNotif(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setInternalNotifications([]);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return internalNotifications.filter((n) => n.unread);
    }
    return internalNotifications;
  }, [internalNotifications, filter]);

  const unreadCount = internalNotifications.filter((n) => n.unread).length;

  // --- FORMATTING ---
  const formatTime = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return ""; // Handle invalid date

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // --- ICONS ---
  const getTypeIcon = (n) => {
    if (n.icon) return n.icon;
    if (n.type === "order")
      return <Package className="w-5 h-5 text-purple-500" />;
    if (n.type === "system")
      return <Calendar className="w-5 h-5 text-blue-500" />;
    if (n.type === "alert")
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
<<<<<<< HEAD
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 right-0 w-full sm:w-96 md:w-96 h-full bg-white shadow-lg z-50 flex flex-col rounded-l-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    onClick={() => onMarkAll()}
                    title="Mark all as read"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => onClose()}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
=======
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full sm:w-[420px] h-[100dvh] bg-white shadow-2xl z-[60] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-gray-100 bg-white z-10">
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="relative bg-orange-100 p-4 rounded-full">
                    <Bell className="w-6 h-6 text-orange-500 " />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Notifications
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      You have {unreadCount} unread messages
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
>>>>>>> 10c61ac9eef67dfebaa502362d59231ecad47fe9
                </button>
              </div>

              {/* Tabs & Actions */}
              <div className="flex items-center justify-between px-6 pb-4">
                <div className="flex items-center bg-gray-100/80 p-1 rounded-lg">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      filter === "all"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      filter === "unread"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Unread
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {internalNotifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {internalNotifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BellOff className="w-12 h-12 text-gray-300" />
                  <p className="text-sm text-gray-500 mt-2">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition relative cursor-pointer ${
                      n.unread
                        ? "bg-orange-50 border border-orange-100"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (n.unread) onMarkRead(n.id);
                      setActiveNotif(n);
                    }}
                  >
                    <div
                      className={`w-10 h-10 ${getTypeColor(
                        n.type
                      )} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}
                    >
                      <span>{n.title?.charAt(0)?.toUpperCase() ?? "N"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">
                          {n.title}
                        </h4>
                        {n.unread && (
                          <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
=======
            {/* List */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Bell className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={n.id}
                    onClick={() => {
                      handleMarkRead(n.id);
                      setActiveNotif(n);
                    }}
                    className={`group relative flex gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                      n.unread
                        ? "bg-white border-blue-100 shadow-sm hover:shadow-md"
                        : "bg-white/60 border-gray-100 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {n.avatar ? (
                        <div className="relative">
                          <img
                            src={n.avatar}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                          />
                          {n.unread && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 ${
                            n.unread ? "bg-blue-50" : "bg-gray-50"
                          }`}
                        >
                          {getTypeIcon(n)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`text-sm truncate pr-4 ${
                            n.unread
                              ? "font-bold text-gray-900"
                              : "font-semibold text-gray-700"
                          }`}
                        >
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatTime(n.time)}
                        </span>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed ${
                          n.unread
                            ? "text-gray-600 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {n.desc}
                      </p>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      {n.unread && (
                        <button
                          onClick={(e) => handleMarkRead(n.id, e)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center text-xs text-gray-400 font-medium">
              Showing last 30 days
>>>>>>> 10c61ac9eef67dfebaa502362d59231ecad47fe9
            </div>

            {/* Footer - View All Link */}
            {notifications.length > 0 && (
              <div className="border-t p-4 flex-shrink-0">
                <Link
                  href="/notifications"
                  className="block text-center text-sm text-orange-500 hover:text-orange-600 font-medium"
                  onClick={() => onClose()}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>

          {/* Details Modal */}
          <AnimatePresence>
            {activeNotif && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setActiveNotif(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          activeNotif.type === "alert"
                            ? "bg-red-50"
                            : "bg-blue-50"
                        }`}
                      >
                        {getTypeIcon(activeNotif)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                          {activeNotif.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {activeNotif.time?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveNotif(null)}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">
                      {activeNotif.title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                      {activeNotif.full || activeNotif.desc}
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveNotif(null)}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(activeNotif.id);
                          setActiveNotif(null);
                        }}
                        className="px-4 py-2.5 bg-white text-red-600 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationSideBar;
