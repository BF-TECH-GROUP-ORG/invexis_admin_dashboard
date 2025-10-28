"use client";
import { useState } from "react";
import {
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


function NotificationSideBar({ expanded = true }) {
          const [notifications] = useState([
            {
              id: 1,
              title: "Invoice",
              desc: "Boost efficiency, save time & money",
              time: "9:50 AM",
            },
            {
              id: 2,
              title: "Invoice",
              desc: "Boost efficiency, save time & money",
              time: "9:50 AM",
            },
            {
              id: 3,
              title: "Invoice",
              desc: "Boost efficiency, save time & money",
              time: "9:50 AM",
            },
          ]);
          const [profileOpen, setProfileOpen] = useState(false);
          const [notifOpen, setNotifOpen] = useState(false);
        
          const sidebarRem = expanded ? 16 : 5;
          const style = {
            width: `calc(100% - ${sidebarRem}rem)`,
          };
  return       
        <AnimatePresence>
        {notifOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/0 z-40"
              onClick={() => setNotifOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full bg-white shadow-lg z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button onClick={() => setNotifOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="p-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    {/* Avatar/Icon */}
                    <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{n.title}</h4>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                    {/* Time */}
                    <span className="text-xs text-gray-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
}
export default NotificationSideBar;
