"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  RefreshCw,
  CheckCheck,
  ExternalLink,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Menu,
  X,
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@/constants/notifications";

const ITEMS_PER_PAGE = 20;

// Icon mapping for dynamic rendering
const IconMap = {
  Activity,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Bell,
};

const NotificationsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const user = session?.user;

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const [readFilter, setReadFilter] = useState("all"); // all | unread | read
  const [intentFilter, setIntentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | priority
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(() => {
    if (user?._id) {
      dispatch(
        fetchNotificationsThunk({
          userId: user._id,
          options: {
            companyId: user.companyId,
            limit: 200, // fetch many and filter client-side
            page: 1,
          },
        })
      );
    }
  }, [user?._id, user?.companyId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [readFilter, intentFilter, searchQuery, sortBy]);

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    if (user?._id) {
      dispatch(markAsReadThunk({ userId: user._id, notificationIds: [id] }));
    }
  };

  const handleMarkAllRead = () => {
    if (user?._id) {
      dispatch(markAllAsReadThunk({ userId: user._id }));
    }
  };

  const handleNotificationClick = (n) => {
    if (n.unread) handleMarkRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const renderIcon = (iconName, className) => {
    const IconComponent = IconMap[iconName] || Bell;
    return <IconComponent className={className} />;
  };

  // ---------------------------------------------------------------------------
  // Client-side filtering + sorting
  // ---------------------------------------------------------------------------
  const filteredAndSorted = useMemo(() => {
    let result = [...notifications];

    // Read state
    if (readFilter === "unread") result = result.filter((n) => n.unread);
    else if (readFilter === "read") result = result.filter((n) => !n.unread);

    // Intent category
    if (intentFilter !== "all") {
      result = result.filter((n) => n.intent === intentFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.desc?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "priority") {
        const score = { urgent: 3, high: 2, normal: 1, low: 0 };
        return (score[b.priority] ?? 0) - (score[a.priority] ?? 0);
      }
      return 0;
    });

    return result;
  }, [notifications, readFilter, intentFilter, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedNotifications = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------------------------------------------------------------------
  // Sidebar content (shared between desktop and mobile drawer)
  // ---------------------------------------------------------------------------
  const SidebarContent = () => (
    <>
      {/* Search */}
      <div className="relative">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">
          Search Inbox
        </label>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Status filter */}
      <div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          Status
        </h3>
        <div className="space-y-2">
          {["all", "unread", "read"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setReadFilter(status);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between group ${readFilter === status
                  ? "bg-gray-100 border-l-4 border-orange-500 text-orange-500"
                  : "text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50"
                }`}
            >
              <span className="capitalize">{status}</span>
              {status === "unread" && unreadCount > 0 && (
                <span
                  className={`px-2.5 rounded-lg text-[10px] font-black ${readFilter === status
                      ? "bg-white text-orange-500"
                      : "bg-orange-500 text-white"
                    }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="pt-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">
          Categories
        </h3>
        <div className="space-y-2">
          {/* All */}
          <button
            onClick={() => {
              setIntentFilter("all");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${intentFilter === "all"
                ? "bg-gray-100 border-l-4 border-orange-500 text-orange-500"
                : "text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50"
              }`}
          >
            <div
              className={`p-1.5 rounded-lg ${intentFilter === "all" ? "bg-orange-50" : "bg-orange-100"
                }`}
            >
              <Bell
                className={`w-4 h-4 ${intentFilter === "all" ? "text-orange-500" : "text-orange-500"
                  }`}
              />
            </div>
            All Alerts
          </button>

          {/* Per-intent buttons */}
          {IntentTabs.filter((t) => t.intent).map((tab) => {
            const ui = getIntentUI(tab.intent);
            const Icon = IconMap[ui.icon] || Bell;
            const isActive = intentFilter === tab.intent;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setIntentFilter(tab.intent);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 ${isActive
                    ? `${ui.bgClass} ${ui.textClass} border-2 ${ui.borderClass} shadow-sm`
                    : "text-gray-600 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50"
                  }`}
              >
                <div
                  className={`p-2 rounded-xl ${isActive ? "bg-white/30" : ui.bgClass}`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-current" : ui.textClass}`}
                  />
                </div>
                {ui.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  // ---------------------------------------------------------------------------
  // Accent colour from intent bg class
  // ---------------------------------------------------------------------------
  const accentBar = (bgClass) => {
    const map = {
      "bg-blue-50": "bg-blue-500",
      "bg-green-50": "bg-green-500",
      "bg-red-50": "bg-red-500",
      "bg-purple-50": "bg-purple-500",
      "bg-yellow-50": "bg-yellow-500",
      "bg-orange-50": "bg-orange-500",
    };
    return map[bgClass] || "bg-gray-400";
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex h-[calc(100vh-5rem)] bg-white relative overflow-hidden">
      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-80 bg-gray-50 z-50 p-6 space-y-8 overflow-y-auto lg:hidden shadow-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop left sidebar */}
      <aside className="hidden lg:block w-80 border-r bg-gray-50/50 p-6 space-y-8 overflow-y-auto backdrop-blur-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/30 min-w-0">
        {/* Sticky header */}
        <header className="px-5 lg:px-8 py-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex-1 flex items-center gap-4 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight truncate">
                    Inbox
                  </h1>
                  <div className="hidden sm:flex px-2 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-md items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </div>
                </div>
                <p className="text-[11px] lg:text-sm text-gray-500 flex items-center gap-2 font-medium">
                  {filteredAndSorted.length} item{filteredAndSorted.length !== 1 ? "s" : ""}
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {/* Sort toggle */}
              <div className="hidden sm:flex items-center bg-gray-50 p-1.5 rounded-2xl border-2 border-gray-100">
                {["newest", "priority"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${sortBy === s
                        ? "bg-white text-orange-500 shadow-md ring-1 ring-black/5"
                        : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    {s === "newest" ? "New" : "Hot"}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl border border-gray-200 bg-white transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Clear unread */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 text-sm font-black"
                >
                  <CheckCheck className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear Unread</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 pb-28">
          <AnimatePresence mode="popLayout">
            {loading && notifications.length === 0 ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-80"
              >
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6" />
                <p className="text-gray-500 font-medium animate-pulse">
                  Syncing notifications...
                </p>
              </motion.div>
            ) : paginatedNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[50vh] bg-white/50 rounded-[3rem] border-2 border-dashed border-gray-100"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Bell className="w-12 h-12 text-gray-200" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Clean Slate!
                </h3>
                <p className="text-gray-400 text-sm max-w-xs text-center font-medium">
                  {readFilter === "unread"
                    ? "You've addressed all urgent matters."
                    : "No notifications match your current filters."}
                </p>
                {(searchQuery || readFilter !== "all" || intentFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setReadFilter("all");
                      setIntentFilter("all");
                    }}
                    className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-4 max-w-4xl mx-auto w-full">
                {paginatedNotifications.map((n, index) => {
                  const ui = getIntentUI(n.intent);
                  const priorityStyle = getPriorityStyle(n.priority);
                  const Icon = IconMap[ui.icon] || Bell;
                  const isUrgent = n.priority === "urgent";

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, delay: index * 0.025 }}
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative flex flex-col md:flex-row gap-4 md:gap-6 p-5 md:px-7 md:py-6 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden ${n.unread
                          ? `bg-white ${ui.borderClass} shadow-sm hover:shadow-lg hover:-translate-y-0.5`
                          : "bg-white/40 border-transparent opacity-80 hover:opacity-100 hover:bg-white hover:border-gray-100 hover:shadow-md"
                        } ${priorityStyle.highlight && n.unread
                          ? priorityStyle.ringClass
                          : ""
                        }`}
                    >
                      {/* Left accent strip for unread */}
                      {n.unread && (
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] ${accentBar(ui.bgClass)}`}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[8deg] ${ui.bgClass} ${isUrgent && n.unread
                            ? "ring-4 ring-red-100 animate-pulse"
                            : "shadow-sm"
                          }`}
                      >
                        <Icon className={`w-7 h-7 lg:w-8 lg:h-8 ${ui.textClass}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg ${ui.bgClass} ${ui.textClass}`}
                          >
                            {ui.label}
                          </span>
                          {isUrgent && (
                            <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase tracking-[0.15em] shadow-lg shadow-red-200">
                              Urgent
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {n.time}
                          </span>
                        </div>

                        <h3
                          className={`font-black text-base lg:text-lg mb-1 tracking-tight leading-tight transition-colors ${n.unread
                              ? "text-gray-900 group-hover:text-orange-600"
                              : "text-gray-500"
                            }`}
                        >
                          {n.title}
                        </h3>
                        <p
                          className={`text-sm leading-relaxed font-medium transition-colors ${n.unread ? "text-gray-600" : "text-gray-400"
                            }`}
                        >
                          {n.desc}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                        {n.unread && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        {n.actionUrl && (
                          <div
                            className={`p-2.5 rounded-xl transition-all transform ${n.unread
                                ? "bg-orange-50 text-orange-500"
                                : "bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500"
                              } group-hover:translate-x-1`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Urgent pulse dot */}
                      {priorityStyle.pulse && n.unread && (
                        <div className="absolute top-4 right-4 h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating pagination bar */}
        {totalPages > 1 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 px-4 pointer-events-none">
            <motion.footer
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gray-900/40 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-4 shadow-2xl border border-white/5 pointer-events-auto ring-1 ring-white/10"
            >
              {/* Page info */}
              <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest hidden sm:block">
                  Page
                </span>
                <span className="text-xs font-black text-white px-2 py-1 bg-white/10 rounded-lg">
                  {currentPage}
                </span>
                <span className="text-white/20">/</span>
                <span className="text-xs font-bold text-white/60">{totalPages}</span>
              </div>

              {/* Prev/Next + page numbers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-white/10 text-white rounded-xl disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {(() => {
                    const pages = [];
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("...");
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return [...new Set(pages)].map((p, i) =>
                      p === "..." ? (
                        <span key={`d-${i}`} className="text-white/20 font-bold px-1 text-[10px]">
                          ..
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === p
                              ? "bg-orange-500 text-white shadow-lg"
                              : "text-white/40 hover:bg-white/5"
                            }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-white/10 text-white rounded-xl disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
