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
      />
    </>
  );
}
