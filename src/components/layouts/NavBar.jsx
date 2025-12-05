"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
// framer-motion removed from NavBar (moved into child components as needed)
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import NotificationSideBar from "./Notifications_Sidebar";
import ProfileSidebar from "./ProfileSidebar";
import { performLogout } from "@/features/AuthSlice";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";

export default function TopNavBar({ expanded = true }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();
  const queryClient = useQueryClient();

  // Get user from Redux
  const { user, isInitialized, status } = useSelector((state) => state.auth);

  // ... (notifications state)

  // State management
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Dummy notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New user registered", read: false, time: "5m ago" },
    { id: 2, message: "Company verified", read: false, time: "1h ago" },
    { id: 3, message: "New order placed", read: true, time: "2h ago" },
  ]);

  // Wait for initialization - keep navbar visible, don't early-return (hooks must be stable)

  // Fallback for user data if not loaded yet
  const displayUser = user || {
    firstName: "Guest",
    lastName: "",
    email: "",
    profilePicture: null,
    profileImage: "/images/user3.jpg",
  };

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
    : "Guest";

  const unreadCount = notifications.filter((n) => !n.read).length;

  // profile data is handled by the ProfileSidebar component

  // Profile update is handled in ProfileSidebar component

  const handleLogout = async () => {
    try {
      showLoader();
      await dispatch(performLogout());
      // clear all client caches so logged-out users don't see stale data
      try {
        queryClient.clear();
      } catch (e) {}
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/auth/login");
    } finally {
      hideLoader();
    }
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Profile editable fields moved to ProfileSidebar

  return (
    <>
      {/* ======= TOP NAVBAR ======= */}
      <header
        className={`fixed top-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ease-in-out`}
        style={{
          left: expanded ? "16rem" : "5rem",
          width: expanded ? "calc(100% - 16rem)" : "calc(100% - 5rem)",
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
                <span className="absolute -top-0.5 -right-[-1.5px] min-w-[0.7rem] h-[11px] w-3 px-0.5 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full"></span>
              )}
            </button>
          </div>

          {/* Profile Section */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 hover:opacity-80 transition group"
          >
            <Image
              src={
                displayUser.profilePicture ||
                displayUser.profileImage ||
                "/images/user3.jpg"
              }
              alt={displayName}
              width={48}
              height={48}
              className="w-10 h-10 rounded-full border-2 border-gray-100 group-hover:border-[#ff782d] transition-colors object-cover"
            />
            <div className="flex flex-col items-start">
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#ff782d] transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {displayUser.email}
              </p>
            </div>
            <ChevronDown
              size={16}
              className="text-gray-400 group-hover:text-[#ff782d] transition-colors"
            />
          </button>
        </div>
      </header>

      {/* PROFILE SIDEBAR */}
      <ProfileSidebar
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />

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
