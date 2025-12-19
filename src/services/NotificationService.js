import api from "@/lib/axios";

/**
 * Fetch notifications for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @param {string} options.companyId - Filter by company ID
 * @param {string} options.shopId - Filter by shop ID
 * @param {string} options.role - Filter by role
 * @param {boolean} options.unreadOnly - Only fetch unread notifications
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50)
 * @returns {Promise} Array of notifications
 */
export const fetchNotifications = async (userId, options = {}) => {
  const { companyId, shopId, role, unreadOnly = false, page = 1, limit = 50 } = options;

  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  if (shopId) params.append("shopId", shopId);
  if (role) params.append("role", role);
  if (unreadOnly) params.append("unreadOnly", "true");
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = `/notification/${userId}${queryString ? `?${queryString}` : ""}`;

  const response = await api.get(url);
  return response.data;
};

/**
 * Mark specific notifications as read
 * @param {string} userId - User ID
 * @param {string[]} notificationIds - Array of notification IDs to mark as read
 * @returns {Promise} Result with updated count
 */
export const markNotificationsAsRead = async (userId, notificationIds) => {
  const response = await api.post("/notification/mark-read", {
    userId,
    notificationIds,
  });
  return response.data;
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise} Result with updated count
 */
export const markAllNotificationsAsRead = async (userId) => {
  const response = await api.post("/notification/mark-read", {
    userId,
    all: true,
  });
  return response.data;
};

/**
 * Fetch unread notification count
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise} Count of unread notifications
 */
export const fetchUnreadCount = async (userId, options = {}) => {
  const notifications = await fetchNotifications(userId, {
    ...options,
    unreadOnly: true,
    limit: 1000, // Get all unread to count
  });
  return Array.isArray(notifications) ? notifications.length : 0;
};

/**
 * Transform backend notification to frontend format
 * 
 * Intent-Based Architecture:
 * - Prefers compiledContent.inApp for rich content
 * - Extracts intent and priority from payload
 * - Includes actionUrl for click-through navigation
 * 
 * @param {object} notification - Backend notification object
 * @param {string} userId - Current user ID
 * @returns {object} Formatted notification for UI
 */
export const transformNotification = (notification, userId) => {
  const isUnread = !notification.readBy?.includes(userId);

  // Extract rich content from compiledContent.inApp (preferred) or fallback to legacy fields
  const inApp = notification.compiledContent?.inApp || {};
  const payload = notification.payload || {};

  return {
    id: notification._id || notification.id,

    // Prefer compiledContent.inApp over legacy title/body
    title: inApp.title || notification.title || "Notification",
    desc: inApp.body || notification.body || notification.message || notification.description || "",
    full: inApp.body || notification.fullMessage || notification.message || notification.description || "",

    // Time formatting
    time: formatTimeAgo(notification.createdAt),
    createdAt: notification.createdAt,

    // Read state
    unread: isUnread,
    read: !isUnread,

    // Legacy type (for backward compatibility)
    type: notification.type || "general",

    // Intent-Based fields (NEW)
    intent: payload.intent || 'operational',
    priority: notification.priority || 'normal',
    role: payload.role || null,
    eventType: payload.eventType || null,
    source: payload.source || null,

    // Actionable notification support
    actionUrl: inApp.actionUrl || null,
    imageUrl: inApp.imageUrl || null,

    // Context data
    companyId: payload.companyId || notification.companyId,
    shopId: payload.shopId || notification.shopId,
    data: inApp.data || notification.data || {},
  };
};

/**
 * Format timestamp to "time ago" string
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted time string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

export default {
  fetchNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  fetchUnreadCount,
  transformNotification,
  formatTimeAgo,
};

