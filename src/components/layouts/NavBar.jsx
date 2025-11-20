"use client";

import { useState } from "react";
import { Search, Bell, Settings, X, Home, User } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import NotificationSideBar from "./Notifications_Sidebar";

export default function TopNavBar({ expanded = true }) {
  const user = {
    username: "John Doe",
    email: "john.doe@example.com",
    profileImage: "/images/user3.jpg",
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Invoice",
      desc: "Boost efficiency, save time & money",
      time: "9:50 AM",
      unread: true,
      full: "Full message for Invoice notification.",
    },
    {
      id: 2,
      title: "Project Update",
      desc: "New version deployed successfully",
      time: "10:15 AM",
      unread: true,
      full: "Full message for Project Update notification.",
    },
    {
      id: 3,
      title: "Team Meeting",
      desc: "Scheduled for tomorrow 9:00 AM",
      time: "2:00 PM",
      unread: true,
      full: "Full message for Team Meeting notification.",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  // Profile sidebar states
  const [editUsername, setEditUsername] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [showImageExplorer, setShowImageExplorer] = useState(false);

  return (
    <>
      {/* ======= TOP NAVBAR ======= */}
      <header
        className={`fixed top-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ease-in-out`}
        style={{
          left: expanded ? "16rem" : "5rem", // this pushes it beside the sidebar
          width: expanded ? "calc(100% - 16rem)" : "calc(100% - 5rem)", // dynamic width
        }}
      >
        {/* Left Section - Logo */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <span className="font-bold text-lg text-gray-950 whitespace-nowrap">
            INVEX<span className="text-orange-500 font-extrabold">iS</span>
          </span>
        </div>

        {/* Middle Section - Search Bar */}
        <div className="flex-1 mx-6">
          <div className="relative w-3/5 mx-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
              aria-label="Search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Right Section - Icons and Profile */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-3 rounded-full border-2 border-gray-200 hover:border-orange-300 transition"
              onClick={() => setNotifOpen((s) => !s)}
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6 text-gray-600 hover:text-orange-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-[-1.5px] min-w-[0.7rem] h-[11px] w-3 px-0.5 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full">
                  {/* {unreadCount > 9 ? "9+" : unreadCount} */}
                </span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button
            className="p-3 rounded-full border-2 border-gray-200 hover:border-orange-300 transition hidden md:flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 text-gray-600 hover:text-orange-500" />
          </button>

          {/* Profile Section */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <Image
              src={user.profileImage}
              alt={user.username}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-orange-300 object-cover"
            />
            <div className="flex flex-col items-start">
              <p className="text-sm font-semibold text-gray-900">
                {user.username}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </button>
        </div>
      </header>

      {/* ======= PROFILE SIDEBAR ======= */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setProfileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full z-50 overflow-y-auto border-l border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Profile</h2>
                <button onClick={() => setProfileOpen(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-[#ff782d]" />
                </button>
              </div>

              {/* Profile Pic + Camera Icon */}
              <div className="flex flex-col items-center mt-8 relative">
                <div className="relative group">
                  <Image
                    src={user.profileImage}
                    alt={user.username}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label
                    htmlFor="profilePicInput"
                    className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer transition"
                    title="Change profile picture"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="#ff782d"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <circle cx="12" cy="12" r="3" fill="#fff" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 13l6-6"
                      />
                    </svg>
                  </label>
                  <input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Editable Fields */}
              <div className="flex flex-col gap-6 mt-8 px-8">
                {/* Username */}
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Username
                  </label>
                  <div className="relative">
                    {!editUsername ? (
                      <button
                        className="w-full text-left py-2 px-3 rounded bg-gray-100 text-gray-900 font-semibold"
                        onClick={() => setEditUsername(true)}
                      >
                        {user.username}
                      </button>
                    ) : (
                      <input
                        type="text"
                        className="w-full py-2 px-3 rounded bg-gray-100 text-gray-900 font-semibold border border-gray-200 focus:border-[#ff782d] focus:ring-1 focus:ring-[#ff782d]"
                        defaultValue={user.username}
                      />
                    )}
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Email
                  </label>
                  <div className="relative">
                    {!editEmail ? (
                      <button
                        className="w-full text-left py-2 px-3 rounded bg-gray-100 text-gray-900 font-semibold"
                        onClick={() => setEditEmail(true)}
                      >
                        {user.email}
                      </button>
                    ) : (
                      <input
                        type="email"
                        className="w-full py-2 px-3 rounded bg-gray-100 text-gray-900 font-semibold border border-gray-200 focus:border-[#ff782d] focus:ring-1 focus:ring-[#ff782d]"
                        defaultValue={user.email}
                      />
                    )}
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Password
                  </label>
                  <div className="relative">
                    {!editPassword ? (
                      <button
                        className="w-full text-left py-2 px-3 rounded bg-gray-100 text-gray-900 font-semibold"
                        onClick={() => setEditPassword(true)}
                      >
                        <span className="tracking-widest">••••••••</span>
                      </button>
                    ) : (
                      <input
                        type="password"
                        className="w-full py-2 px-3 rounded bg-gray-100 text-gray-900 font-semibold border border-gray-200 focus:border-[#ff782d] focus:ring-1 focus:ring-[#ff782d]"
                        defaultValue=""
                        placeholder="Enter new password"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======= NOTIFICATION SIDEBAR ======= */}
      <NotificationSideBar
        expanded={expanded}
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAll={handleMarkAllRead}
      />
    </>
  );
}
