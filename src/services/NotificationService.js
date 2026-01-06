import apiClient from "@/lib/apiClient";

const API_BASE = "/notification";

/**
 * Get User Notifications
 */
export async function getNotifications({
  page = 1,
  limit = 10,
  unreadOnly,
  role,
  companyId,
  type,
} = {}) {
  const params = { page, limit };
  if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;
  if (role) params.role = role;
  if (companyId) params.companyId = companyId;
  if (type) params.type = type;

  return apiClient.get(API_BASE, { params });
}

// Alias for backward compatibility
export const fetchNotifications = async (userId, options = {}) => {
  return getNotifications(options);
};

/**
 * Mark Notifications as Read
 */
export async function markNotificationsRead({ notificationIds, all } = {}) {
  return apiClient.post(`${API_BASE}/mark-read`, {
    notificationIds,
    all,
  });
}

// Aliases
export const markNotificationsAsRead = async (userId, notificationIds) => {
  return markNotificationsRead({ notificationIds });
};

export const markAllNotificationsAsRead = async (userId) => {
  return markNotificationsRead({ all: true });
};

/**
 * Create Notification (Admin / System Testing)
 */
export async function createNotification(payload) {
  return apiClient.post(API_BASE, payload);
}

/**
 * Fetch unread notification count
 */
export const fetchUnreadCount = async (userId, options = {}) => {
  const notifications = await fetchNotifications(userId, {
    ...options,
    unreadOnly: true,
    limit: 1000,
  });

  // Since apiClient returns the payload, let's normalize
  const data = notifications?.data || notifications || [];
  return Array.isArray(data) ? data.length : 0;
};

/**
 * Transform backend notification to frontend format
 */
export const transformNotification = (notification, userId) => {
  if (!notification) return {};

  const readBy = notification.readBy || [];
  const isUnread = !readBy.includes(userId);

  const inApp = notification.compiledContent?.inApp || {};
  const data = inApp.data || notification.data || {};
  const payload = notification.payload || {};

  return {
    id: notification._id || notification.id,
    title: inApp.title || notification.title || "Notification",
    desc: inApp.body || notification.body || notification.message || "",
    full: inApp.body || notification.fullMessage || notification.message || "",
    time: formatTimeAgo(notification.createdAt),
    createdAt: notification.createdAt,
    unread: isUnread,
    read: !isUnread,
    type: notification.type || "general",
    intent:
      data.intent || payload.intent || notification.intent || "operational",
    priority:
      data.priority || payload.priority || notification.priority || "normal",
    role: data.role || payload.role || null,
    source: data.source || payload.source || null,
    actionUrl: inApp.actionUrl || data.actionUrl || null,
    imageUrl: inApp.imageUrl || null,
    companyId: data.companyId || payload.companyId || notification.companyId,
    shopId: data.shopId || payload.shopId || notification.shopId,
    data: data,
  };
};

/**
 * Format timestamp to "time ago" string
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
