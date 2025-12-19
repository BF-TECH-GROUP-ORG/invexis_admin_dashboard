"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  Loader2,
  RefreshCw,
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  ExternalLink,
  Trash2
} from "lucide-react";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
} from "@/features/NotificationSlice";
import {
  IntentTabs,
  getIntentUI,
  getPriorityStyle,
  filterByIntent
} from "@/constants/notifications";

// Icon mapping
const IconMap = {
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Bell
};

const NotificationsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const user = session?.user;

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const [activeTab, setActiveTab] = useState('all'); // Intent tab
  const [filterState, setFilterState] = useState("all"); // all, unread, read
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
            unreadOnly: filterState === "unread",
            page,
            limit,
          },
        })
      );
    }
  }, [user?.id, user?.companyId, filterState, page, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    if (user?.id) {
      dispatch(markAsReadThunk({ userId: user.id, notificationIds: [id] }));
    }
  };

  const handleMarkAllRead = () => {
    if (user?.id) {
      // Logic could be improved to only mark filtered items
      dispatch(markAllAsReadThunk({ userId: user.id }));
    }
  };

  const handleAction = (n) => {
    if (n.actionUrl) {
      handleMarkRead(n.id);
      router.push(n.actionUrl);
    }
  };

  // Local filtering combining Intent + Read State
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // 1. Filter by Intent Tab
    const currentTab = IntentTabs.find(t => t.key === activeTab);
    if (currentTab && currentTab.intent) {
      filtered = filterByIntent(filtered, currentTab.intent);
    }

    // 2. Filter by Read State
    if (filterState === "unread") {
      filtered = filtered.filter((n) => n.unread);
    } else if (filterState === "read") {
      filtered = filtered.filter((n) => !n.unread);
    }

    return filtered;
  }, [notifications, activeTab, filterState]);

  const renderIcon = (iconName, className) => {
    const IconComponent = IconMap[iconName] || Bell;
    return <IconComponent className={className} />;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Bell className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inbox</h1>
            <p className="text-sm font-medium text-gray-500">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition shadow-sm border border-gray-200 bg-white"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition shadow-lg shadow-gray-200"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Read State Filters */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterState(f)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${filterState === f
                    ? "bg-gray-50 text-orange-600"
                    : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-700"
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {filterState === f && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Intent Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">By Category</h3>
            <div className="space-y-1">
              {IntentTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = IconMap[tab.icon] || Bell;

                // Calculate count per intent if we wanted to (omitted for perf/brevity)

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                        ? "bg-orange-50 text-orange-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content - Notification List */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-gray-500 mt-4 font-medium">Loading your inbox...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 border-dashed">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  {renderIcon(IntentTabs.find(t => t.key === activeTab)?.icon || 'Bell', "w-10 h-10 text-gray-300")}
                </div>
                <h3 className="text-lg font-bold text-gray-900">No notifications found</h3>
                <p className="text-gray-400 mt-1 max-w-sm text-center">
                  {filterState !== "all"
                    ? `You have no ${filterState} notifications in this category.`
                    : "You're all caught up! Check back later for updates."}
                </p>
                {(filterState !== "all" || activeTab !== "all") && (
                  <button
                    onClick={() => { setFilterState("all"); setActiveTab("all"); }}
                    className="mt-6 text-orange-600 font-bold text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onAction={handleAction}
                  renderIcon={renderIcon}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification, onMarkRead, onAction, renderIcon }) => {
  const [expanded, setExpanded] = useState(false);
  const intentUI = getIntentUI(notification.intent);
  const priorityStyle = getPriorityStyle(notification.priority);

  return (
    <div
      className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${notification.unread
          ? "bg-white shadow-sm hover:shadow-md border-gray-200"
          : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200"
        } ${priorityStyle.highlight && notification.unread ? "ring-1 ring-inset " + priorityStyle.ringClass : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-5">

        {/* Icon */}
        <div
          className={`w-12 h-12 ${notification.unread ? intentUI.bgClass : 'bg-gray-100'} rounded-full flex items-center justify-center flex-shrink-0 transition-colors`}
        >
          {renderIcon(intentUI.icon, `w-6 h-6 ${notification.unread ? intentUI.textClass : 'text-gray-400'}`)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              {notification.intent && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${intentUI.bgClass} ${intentUI.textClass}`}>
                  {intentUI.label}
                </span>
              )}
              {priorityStyle.badgeClass && notification.unread && notification.priority === 'urgent' && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityStyle.badgeClass}`}>
                  URGENT
                </span>
              )}
              <h3 className={`text-base ${notification.unread ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                {notification.title}
              </h3>
            </div>

            <span className="text-xs text-gray-400 whitespace-nowrap">
              {notification.time}
            </span>
          </div>

          <p
            className={`text-sm text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-2"
              }`}
          >
            {expanded
              ? notification.full || notification.desc
              : notification.desc}
          </p>

          {/* Action Area */}
          <div className="mt-4 flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
            {notification.actionUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(notification);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors"
              >
                Take Action <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {notification.unread && (
              <button
                onClick={(e) => onMarkRead(notification.id, e)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Check className="w-3 h-3" /> Mark Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pulse for urgent items */}
      {priorityStyle.pulse && notification.unread && (
        <div className="absolute top-5 right-5 h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
