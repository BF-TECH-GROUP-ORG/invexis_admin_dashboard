"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
} from "@/features/NotificationSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const user = session?.user;

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const [filter, setFilter] = useState("all"); // all, unread, read
  const [page, setPage] = useState(1);
  const limit = 50;

  // Fetch notifications
  const fetchData = useCallback(() => {
    if (user?.id) {
      dispatch(
        fetchNotificationsThunk({
          userId: user.id,
          options: {
            companyId: user.companyId,
            unreadOnly: filter === "unread",
            page,
            limit,
          },
        })
      );
    }
  }, [user?.id, user?.companyId, filter, page, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = (id) => {
    if (user?.id) {
      dispatch(markAsReadThunk({ userId: user.id, notificationIds: [id] }));
    }
  };

  const handleMarkAllRead = () => {
    if (user?.id) {
      dispatch(markAllAsReadThunk({ userId: user.id }));
    }
  };

  // Filter notifications locally for "read" filter
  const filteredNotifications =
    filter === "read" ? notifications.filter((n) => !n.unread) : notifications;

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-gray-500 mt-3">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
            <BellOff className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 mt-3 text-lg">No notifications</p>
            <p className="text-gray-400 text-sm">
              {filter !== "all"
                ? `No ${filter} notifications found`
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              getTypeColor={getTypeColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification, onMarkRead, getTypeColor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`p-4 rounded-xl border transition cursor-pointer ${
        notification.unread
          ? "bg-orange-50 border-orange-200 hover:border-orange-300"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 ${getTypeColor(
            notification.type
          )} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}
        >
          {notification.title?.charAt(0)?.toUpperCase() ?? "N"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {notification.title}
              </h3>
              {notification.unread && (
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {notification.time}
            </span>
          </div>
          <p
            className={`text-sm text-gray-600 mt-1 ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {expanded
              ? notification.full || notification.desc
              : notification.desc}
          </p>
          {notification.unread && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="mt-2 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              <Check className="w-3 h-3" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
