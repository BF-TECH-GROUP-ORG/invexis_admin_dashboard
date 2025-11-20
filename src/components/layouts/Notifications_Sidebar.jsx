"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function NotificationSideBar({
  expanded = true,
  isOpen = false,
  onClose = () => {},
  notifications = [],
  onMarkRead = () => {},
  onMarkAll = () => {},
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
            className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full bg-white shadow-lg z-50 overflow-y-auto rounded-l-lg"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <div className="flex items-center gap-3">
                <button
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => onMarkAll()}
                  title="Mark all as read"
                >
                  Mark all
                </button>
                <button onClick={() => onClose()}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white outline outline-gray-200 hover:bg-gray-100 transition relative cursor-pointer"
                  onClick={() => {
                    // Ask parent to mark read and show popup
                    onMarkRead(n.id);
                    setActiveNotif(n);
                  }}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-lg relative flex items-center justify-center text-white font-bold">
                    {/* icon / initials */}
                    <span>{n.title?.charAt(0) ?? "N"}</span>
                    {n.unread && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{n.title}</h4>
                      {n.unread && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>
              ))}
            </div>
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
