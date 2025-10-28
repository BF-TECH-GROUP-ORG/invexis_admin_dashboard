"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  X,
  Home,
  User,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TopNavBar({ expanded = true }) {
  const user = {
    username: "John Doe",
    email: "john.doe@example.com",
    profileImage: "/images/user3.jpg",
  };

  const [notifications] = useState([
    { id: 1, title: "Invoice", desc: "Boost efficiency, save time & money", time: "9:50 AM" },
    { id: 2, title: "Project Update", desc: "New version deployed successfully", time: "10:15 AM" },
    { id: 3, title: "Team Meeting", desc: "Scheduled for tomorrow 9:00 AM", time: "2:00 PM" },
  ]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      {/* ======= TOP NAVBAR ======= */}
      <header
        className={`fixed top-0 right-0 z-40 flex items-center justify-between px-3 md:px-4 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ease-in-out`}
        style={{
          left: expanded ? "16rem" : "5rem", // this pushes it beside the sidebar
          width: expanded ? "calc(100% - 16rem)" : "calc(100% - 5rem)", // dynamic width
        }}
      >
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="ml-1 px-2 py-1 font-semibold text-lg text-gray-600">
            Welcome {user.username}!
          </span>
        </div>

        <div className="flex-1" />

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search"
              className="pl-8 pr-3 py-4 rounded-xl px-8 bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition w-36 md:w-48 lg:w-64"
              aria-label="Search"
            />
            <Search className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Bell
              className="w-7 h-7 text-gray-500 hover:text-orange-500 cursor-pointer"
              onClick={() => setNotifOpen(true)}
            />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-1 flex items-center justify-center leading-none transform translate-x-1 animate-pulse">
                {notifications.length}
              </span>
            )}
          </div>

          {/* Settings */}
          <Settings className="hidden md:block w-7 h-7 text-gray-500 hover:text-orange-500 cursor-pointer" />

          {/* Profile */}
          <div>
            <Image
              src={user.profileImage}
              alt={user.username}
              width={40}
              height={40}
              className="w-12 h-12 rounded-full border-2 border-orange-200 cursor-pointer object-cover"
              onClick={() => setProfileOpen(true)}
            />
          </div>
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
              className="fixed inset-0 bg-black/0 z-40"
              onClick={() => setProfileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full bg-white shadow-lg z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button onClick={() => setProfileOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              <div className="flex flex-col items-center mt-6">
                <Image
                  src={user.profileImage}
                  alt={user.username}
                  width={90}
                  height={90}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                />
                <h3 className="mt-3 text-lg font-bold">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <nav className="mt-10 px-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100"
                >
                  <Home className="w-5 h-5 text-gray-500" /> Home
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 w-full px-4 py-2 rounded hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-gray-500" /> Profile
                </Link>
              </nav>

              <div className="px-4 py-10">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-center py-2 bg-red-500 text-white font-semibold hover:bg-white hover:text-red-500 hover:border-red-500 hover:border-2 rounded-lg"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======= NOTIFICATION SIDEBAR ======= */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/0 z-40"
              onClick={() => setNotifOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed top-0 right-0 w-full sm:w-96 md:w-80 h-full bg-white shadow-lg z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button onClick={() => setNotifOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-orange-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{n.title}</h4>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                    <span className="text-xs text-gray-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
