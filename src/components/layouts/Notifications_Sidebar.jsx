"use client";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  CheckCircle,
  Bell,
  Trash2,
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
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

// Icon mapping for dynamic rendering
const IconMap = {
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Bell
};

function NotificationSideBar({
  expanded = true,
  isOpen = false,
  onClose = () => { },
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const user = session?.user;

  // Redux state
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const [activeNotif, setActiveNotif] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // Intent tab
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch notifications when sidebar opens
  useEffect(() => {
    if (isOpen && user?._id) {
      dispatch(fetchNotificationsThunk({
        userId: user._id,
        options: {
          companyId: user.companyId,
          limit: 50,
        },
      }));
    }
  }, [isOpen, user?.id, user?.companyId, dispatch]);

  // --- ACTIONS ---
  const handleMarkAllRead = () => {
    if (user?._id) {
      // If filtering by intent, only mark those? 
      // Current backend API supports marking specific IDs or ALL.
      // For simplicity/safety, we'll mark displayed ones if possible, or just all.
      // Let's stick to marking all for now or displayed IDs.
      const idsToMark = filteredNotifications.filter(n => n.unread).map(n => n.id);
      if (idsToMark.length > 0) {
        dispatch(markAsReadThunk({
          userId: user._id,
          notificationIds: idsToMark
        }));
      }
    }
  };

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    if (user?._id) {
      dispatch(markAsReadThunk({
        userId: user._id,
        notificationIds: [id]
      }));
    }
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    handleMarkRead(id, e);
    if (activeNotif?.id === id) setActiveNotif(null);
  };

  const handleAction = (n, e) => {
    if (e) e.stopPropagation();
    if (n.actionUrl) {
      handleMarkRead(n.id); // Auto-read on interaction
      onClose();
      router.push(n.actionUrl);
    } else {
      setActiveNotif(n);
    }
  };

  // --- FILTERING ---
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // 1. Filter by Intent Tab
    const currentTab = IntentTabs.find(t => t.key === activeTab);
    if (currentTab && currentTab.intent) {
      filtered = filterByIntent(filtered, currentTab.intent);
    }

    // 2. Filter by Unread Toggle
    if (showUnreadOnly) {
      filtered = filtered.filter(n => n.unread);
    }

    return filtered;
  }, [notifications, activeTab, showUnreadOnly]);

  // --- RENDER HELPERS ---
  const renderIcon = (iconName, className) => {
    const IconComponent = IconMap[iconName] || Bell;
    return <IconComponent className={className} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full sm:w-[480px] h-[100dvh] bg-white shadow-2xl z-[60] flex flex-col font-sans border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex flex-col bg-white z-10 border-b border-gray-100">
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="relative bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <Bell className="w-6 h-6 text-orange-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Inbox
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {unreadCount} unread messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${showUnreadOnly
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    Unread only
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Intent Tabs */}
              <div className="px-6 pb-0 overflow-x-auto no-scrollbar">
                <div className="flex gap-6 border-b border-gray-100">
                  {IntentTabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = IconMap[tab.icon];
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 flex items-center gap-2 text-sm font-medium transition-all relative ${isActive
                          ? "text-gray-900"
                          : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : ""}`} />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-3">
              {/* Toolbar */}
              {notifications.length > 0 && (
                <div className="flex justify-end px-2 mb-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-gray-400 hover:text-orange-600 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark visible as read
                  </button>
                </div>
              )}

              {loading && notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
                  <p className="text-sm font-medium">Loading...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {renderIcon(IntentTabs.find(t => t.key === activeTab)?.icon || 'Bell', "w-8 h-8 text-gray-300")}
                  </div>
                  <p className="text-sm font-medium text-gray-900">No notifications found</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                    {showUnreadOnly
                      ? "You have no unread messages in this category."
                      : "You're all caught up! No notifications to display."}
                  </p>
                  {showUnreadOnly && (
                    <button
                      onClick={() => setShowUnreadOnly(false)}
                      className="mt-4 text-orange-600 text-xs font-bold hover:underline"
                    >
                      View all notifications
                    </button>
                  )}
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const intentUI = getIntentUI(n.intent);
                  const priorityStyle = getPriorityStyle(n.priority);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={n.id || `notif-${index}`}
                      onClick={(e) => handleAction(n, e)}
                      className={`group relative flex gap-4 p-4 rounded-xl cursor-pointer transition-all border
                        ${n.unread ? "bg-white shadow-sm hover:shadow-md" : "bg-white/40 hover:bg-white border-transparent hover:shadow-sm"}
                        ${priorityStyle.highlight && n.unread ? "border-l-4 " + intentUI.borderClass.replace('border', 'border-l') : "border-gray-100"}
                      `}
                    >
                      {/* Priority Pulse */}
                      {priorityStyle.pulse && n.unread && (
                        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}

                      {/* Icon */}
                      <div className="flex-shrink-0 pt-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.unread ? intentUI.bgClass : 'bg-gray-100'}`}>
                          {renderIcon(intentUI.icon, `w-5 h-5 ${n.unread ? intentUI.textClass : 'text-gray-400'}`)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm pr-6 leading-tight ${n.unread ? "font-bold text-gray-900" : "font-semibold text-gray-600"}`}>
                            {n.title}
                          </h4>
                        </div>
                        <p className={`text-xs leading-relaxed mb-2 ${n.unread ? "text-gray-600" : "text-gray-500"}`}>
                          {n.desc}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            {n.time}
                          </span>
                          {n.intent && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold ${intentUI.bgClass} ${intentUI.textClass} bg-opacity-50`}>
                              {intentUI.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                        {n.actionUrl && (
                          <div className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {n.unread && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          className="p-1.5 text-red-600 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <Link
                href="/notifications"
                className="flex items-center justify-center w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                onClick={() => onClose()}
              >
                View Full Inbox
              </Link>
            </div>
          </motion.div>

          {/* Details Modal */}
          <AnimatePresence>
            {activeNotif && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setActiveNotif(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`px-6 py-6 border-b border-gray-100 flex items-start gap-4 ${getIntentUI(activeNotif.intent).bgClass} bg-opacity-30`}>
                    <div className={`p-3 rounded-full ${getIntentUI(activeNotif.intent).bgClass}`}>
                      {renderIcon(getIntentUI(activeNotif.intent).icon, `w-6 h-6 ${getIntentUI(activeNotif.intent).textClass}`)}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${getIntentUI(activeNotif.intent).textClass}`}>
                        {getIntentUI(activeNotif.intent).label}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight mt-1">
                        {activeNotif.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveNotif(null)}
                      className="p-1 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-600 bg-white/50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-gray-600 leading-loose mb-6">
                      {activeNotif.full || activeNotif.desc}
                    </p>

                    {activeNotif.actionUrl && (
                      <button
                        onClick={() => {
                          handleMarkRead(activeNotif.id);
                          onClose();
                          router.push(activeNotif.actionUrl);
                        }}
                        className="w-full mb-3 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                      >
                        Take Action <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveNotif(null)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationSideBar;
