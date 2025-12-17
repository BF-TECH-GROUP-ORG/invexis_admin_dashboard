"use client";
import { useState } from "react";
import { X, Bell, BellOff, Loader2 } from "lucide-react";
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

function NotificationSideBar({
  expanded = true,
  isOpen = false,
  onClose = () => {},
  notifications = [],
  onMarkRead = () => {},
  onMarkAll = () => {},
  loading = false,
  unreadCount = 0,
}) {
  const [activeNotif, setActiveNotif] = useState(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => onClose()}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
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
                </button>
              </div>
            </div>

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
          {/* Notification Full Message Popup */}
          <AnimatePresence>
            {activeNotif && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                onClick={() => setActiveNotif(null)}
              >
                <div
                  className="bg-white rounded-lg p-6 w-80 outline outline-gray-200 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2"
                    onClick={() => setActiveNotif(null)}
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-[#ff782d]" />
                  </button>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {activeNotif.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {activeNotif.full}
                  </p>
                  <span className="text-xs text-gray-400">
                    {activeNotif.time}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationSideBar;
