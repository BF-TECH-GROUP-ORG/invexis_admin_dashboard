import api from "@/lib/axios";

const API_BASE = "/notification";

/**
 * Get User Notifications
 * GET /api/notifications
 * @param {Object} params
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 50)
 * @param {boolean} params.unreadOnly - Filter unread items
 * @param {string} params.role - Filter by user role
 * @param {string} params.companyId - Filter by company context
 * @param {string} params.type - Filter by notification type
 */
export async function getNotifications({ page = 1, limit = 10, unreadOnly, role, companyId, type } = {}) {
  try {
    const params = { page, limit };
    if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;
    if (role) params.role = role;
    if (companyId) params.companyId = companyId;
    if (type) params.type = type;

    const response = await api.get(API_BASE, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

// Alias for backward compatibility (adapters for existing code)
export const fetchNotifications = async (userId, options = {}) => {
  return getNotifications(options);
};

/**
 * Mark Notifications as Read
 * POST /api/notifications/mark-read
 * @param {Object} payload
 * @param {string[]} payload.notificationIds - Array of notification IDs
 * @param {boolean} payload.all - Mark all as read
 */
export async function markNotificationsRead({ notificationIds, all } = {}) {
  try {
    const response = await api.post(`${API_BASE}/mark-read`, {
      notificationIds,
      all,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
}

// Alias
export const markNotificationsAsRead = async (userId, notificationIds) => {
  return markNotificationsRead({ notificationIds });
};

export const markAllNotificationsAsRead = async (userId) => {
  return markNotificationsRead({ all: true });
};

/**
 * Create Notification (Admin / System Testing)
 * POST /api/notifications
 */
export async function createNotification(payload) {
  try {
    const response = await api.post(API_BASE, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

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
  // The backend might send metadata in 'data' (nested in inApp) or at root level
  const data = inApp.data || notification.data || {};
  const payload = notification.payload || {};

  return {
    id: notification._id || notification.id,

    // Content: compiled content takes precedence
    title: inApp.title || notification.title || "Notification",
    // Use compiled body if available
    desc: inApp.body || notification.body || notification.message || "",
    full: inApp.body || notification.fullMessage || notification.message || "",

    // Time formatting
    time: formatTimeAgo(notification.createdAt),
    createdAt: notification.createdAt,

    // Read state
    unread: isUnread,
    read: !isUnread,

    // Classification
    type: notification.type || "general",

    // Intent & Priority: Check data/payload first, fallback to defaults
    intent: data.intent || payload.intent || notification.intent || 'operational',
    priority: data.priority || payload.priority || notification.priority || 'normal',

    // Metadata
    role: data.role || payload.role || null,
    source: data.source || payload.source || null,

    // Action support
    actionUrl: inApp.actionUrl || data.actionUrl || null,
    imageUrl: inApp.imageUrl || null,

    // Context
    companyId: data.companyId || payload.companyId || notification.companyId,
    shopId: data.shopId || payload.shopId || notification.shopId,
    data: data,
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
  getNotifications,
  markNotificationsRead,
  createNotification,
  fetchNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  fetchUnreadCount,
  transformNotification,
  formatTimeAgo,
};

