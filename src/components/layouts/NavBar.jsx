"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import NotificationSideBar from "./Notifications_Sidebar";
import ProfileSidebar from "./ProfileSidebar";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { logout as logoutBackend } from "@/services/AuthService";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  addNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
} from "@/features/NotificationSlice";

export default function TopNavBar({ expanded = true }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();
  const { subscribeNotifications, unsubscribeNotifications, isConnected } =
    useWebSocket();

  // Get user from NextAuth session
  const user = session?.user;

  // Redux state for notifications
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const notificationsLoading = useSelector(selectNotificationsLoading);

  // State management
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(
        fetchNotificationsThunk({
          userId: user.id,
          options: { companyId: user.companyId, limit: 20 },
        })
      );
    }
  }, [user?.id, user?.companyId, dispatch]);

  // Subscribe to real-time notifications via WebSocket
  useEffect(() => {
    if (!user?.id || !isConnected) return;

    const handleNewNotification = (notification) => {
      console.log("[NavBar] New notification received:", notification);
      dispatch(addNotification({ notification, userId: user.id }));

      // Extract Semantic Data
      const payload = notification.payload || {};
      const intent = payload.intent || notification.intent || 'operational';
      const priority = notification.priority || 'normal';

      // Map Intent to Toast Severity
      const severityMap = {
        operational: 'info',
        financial: 'success',
        risk_security: 'error',
        strategic_insight: 'info', // or a custom 'primary' if supported, else 'info'
        accountability: 'warning'
      };

      // Show toast notification with semantic styling
      showNotification({
        message: notification.title || "New notification",
        description: notification.body || "", // If supported by toast, otherwise just message
        severity: severityMap[intent] || 'info',
        duration: priority === 'urgent' ? 10000 : 3000
      });
    };

    subscribeNotifications(handleNewNotification);

    return () => {
      unsubscribeNotifications();
    };
  }, [
    user?.id,
    isConnected,
    subscribeNotifications,
    unsubscribeNotifications,
    dispatch,
    showNotification,
  ]);

  const handleLogout = async () => {
    try {
      showLoader();
      // First, logout from backend to close session (send access token)
      await logoutBackend(session?.accessToken);
      // Then logout from NextAuth
      await signOut({ callbackUrl: "/auth/login" });
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/auth/login");
    } finally {
      hideLoader();
    }
  };

  const handleMarkRead = useCallback(
    (id) => {
      if (user?.id) {
        dispatch(markAsReadThunk({ userId: user.id, notificationIds: [id] }));
      }
    },
    [user?.id, dispatch]
  );

  const handleMarkAllRead = useCallback(() => {
    if (user?.id) {
      dispatch(markAllAsReadThunk({ userId: user.id }));
    }
  }, [user?.id, dispatch]);

  return (
    <>
      {/* ======= TOP NAVBAR ======= */}
      <header
        className={`fixed top-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ease-in-out`}
        style={{
          left: expanded ? "280px" : "72px",
          width: expanded ? "calc(100% - 280px)" : "calc(100% - 72px)",
        }}
      >
        {/* Left Section - Icon only on mobile */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0 md:hidden">
          <img src="/favicon.svg" alt="Logo" className="h-9 w-9" />
        </div>

        {/* Middle Section - Modern Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-gray-100/80 border border-transparent focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 text-sm transition-all outline-none"
              aria-label="Search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
        </div>

        {/* Right Section - Icons and Profile */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
            onClick={() => setNotifOpen((s) => !s)}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white animate-in zoom-in duration-300">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />

          {/* Profile Section */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 p-1.5 pl-1.5 pr-3 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-gray-50/50 transition-all group active:scale-95"
          >
            <div className="relative">
              <Image
                src={
                  displayUser.profilePicture ||
                  displayUser.profileImage ||
                  "/images/user3.jpg"
                }
                alt={displayName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white group-hover:border-orange-200 shadow-sm object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden lg:flex flex-col items-start translate-y-[1px]">
              <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-tight opacity-70">
                {user?.role || "Admin"}
              </p>
            </div>
            <ChevronDown
              size={16}
              className="text-gray-400 group-hover:text-orange-500 transition-all hidden md:block"
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
      />
    </>
  );
}
