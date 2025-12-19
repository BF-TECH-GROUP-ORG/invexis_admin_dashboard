/**
 * Notification Service Test Utility
 * 
 * This utility helps test the notification service integration
 * by providing mock notifications and API testing functions.
 */

import apiClient from "@/apiClient";

/**
 * Test notification types with sample data
 */
export const NOTIFICATION_TYPES = {
  INVENTORY_ALERT: {
    type: "inventory_alert",
    priority: "high",
    title: "Stock Alert",
    body: "Inventory for 'Milk' is low (10 units left).",
    payload: { productId: "123", currentStock: 10 },
  },
  PAYMENT_SUCCESS: {
    type: "payment_success",
    priority: "normal",
    title: "Payment Received",
    body: "Payment of $250 received from Customer #4521",
    payload: { orderId: "ORD-2024-001", amount: 250 },
  },
  ORDER_PLACED: {
    type: "order_placed",
    priority: "normal",
    title: "New Order",
    body: "Order #ORD-2024-002 has been placed",
    payload: { orderId: "ORD-2024-002", items: 5 },
  },
  SYSTEM_UPDATE: {
    type: "system_update",
    priority: "low",
    title: "System Maintenance",
    body: "Scheduled maintenance tonight at 2:00 AM",
    payload: { scheduledTime: "2024-12-19T02:00:00Z" },
  },
  USER_REGISTERED: {
    type: "user_registered",
    priority: "normal",
    title: "New User Registration",
    body: "New user 'john.doe@example.com' has registered",
    payload: { userId: "USR-001", email: "john.doe@example.com" },
  },
};

/**
 * Fetch notifications for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise} Notifications data
 */
export async function fetchNotifications(userId, options = {}) {
  try {
    const params = new URLSearchParams();
    
    if (options.unreadOnly) params.append("unreadOnly", "true");
    if (options.page) params.append("page", options.page);
    if (options.limit) params.append("limit", options.limit);
    if (options.companyId) params.append("companyId", options.companyId);
    if (options.role) params.append("role", options.role);

    const queryString = params.toString();
    const url = `/notification/${userId}${queryString ? `?${queryString}` : ""}`;
    
    console.log("[Notification Test] Fetching:", url);
    const response = await apiClient.get(url);
    
    console.log("[Notification Test] Response:", response);
    return response;
  } catch (error) {
    console.error("[Notification Test] Fetch Error:", error);
    throw error;
  }
}

/**
 * Mark notifications as read
 * @param {string} userId - User ID
 * @param {string[]} notificationIds - Array of notification IDs
 * @returns {Promise} Result
 */
export async function markAsRead(userId, notificationIds) {
  try {
    console.log("[Notification Test] Marking as read:", { userId, notificationIds });
    
    const response = await apiClient.post("/notification/mark-read", {
      userId,
      notificationIds,
    });
    
    console.log("[Notification Test] Mark Read Response:", response);
    return response;
  } catch (error) {
    console.error("[Notification Test] Mark Read Error:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 * @returns {Promise} Result
 */
export async function markAllAsRead(userId) {
  try {
    console.log("[Notification Test] Marking all as read for:", userId);
    
    const response = await apiClient.post("/notification/mark-read", {
      userId,
      all: true,
    });
    
    console.log("[Notification Test] Mark All Read Response:", response);
    return response;
  } catch (error) {
    console.error("[Notification Test] Mark All Read Error:", error);
    throw error;
  }
}

/**
 * Create a test notification (for testing purposes)
 * @param {string} recipientId - Target user ID
 * @param {string} companyId - Company ID
 * @param {object} notificationData - Notification data
 * @returns {Promise} Created notification
 */
export async function createTestNotification(recipientId, companyId, notificationData) {
  try {
    const payload = {
      type: notificationData.type || "custom_alert",
      recipient: recipientId,
      companyId: companyId,
      message: {
        title: notificationData.title || "Test Notification",
        body: notificationData.body || "This is a test notification",
      },
      data: notificationData.payload || {},
      priority: notificationData.priority || "normal",
    };
    
    console.log("[Notification Test] Creating notification:", payload);
    
    const response = await apiClient.post("/notification", payload);
    
    console.log("[Notification Test] Create Response:", response);
    return response;
  } catch (error) {
    console.error("[Notification Test] Create Error:", error);
    throw error;
  }
}

/**
 * Test notification service health
 * @returns {Promise<boolean>} Service health status
 */
export async function testNotificationService() {
  try {
    console.log("[Notification Test] Testing service health...");
    
    // Try to fetch with a test user ID
    const testUserId = "test-user-123";
    await fetchNotifications(testUserId, { limit: 1 });
    
    console.log("[Notification Test] ✅ Service is healthy");
    return true;
  } catch (error) {
    console.error("[Notification Test] ❌ Service health check failed:", error);
    return false;
  }
}

/**
 * Run comprehensive notification tests
 * @param {string} userId - User ID to test with
 * @param {string} companyId - Company ID to test with
 */
export async function runNotificationTests(userId, companyId) {
  console.log("=== Starting Notification Service Tests ===");
  
  const results = {
    fetch: false,
    create: false,
    markRead: false,
    markAllRead: false,
  };
  
  try {
    // Test 1: Fetch notifications
    console.log("\n[Test 1] Fetching notifications...");
    const notifications = await fetchNotifications(userId, { limit: 10 });
    results.fetch = true;
    console.log("✅ Fetch test passed:", notifications);
  } catch (error) {
    console.error("❌ Fetch test failed:", error.message);
  }
  
  try {
    // Test 2: Create notification
    console.log("\n[Test 2] Creating test notification...");
    const created = await createTestNotification(
      userId,
      companyId,
      NOTIFICATION_TYPES.INVENTORY_ALERT
    );
    results.create = true;
    console.log("✅ Create test passed:", created);
  } catch (error) {
    console.error("❌ Create test failed:", error.message);
  }
  
  try {
    // Test 3: Mark as read
    console.log("\n[Test 3] Marking notification as read...");
    const marked = await markAsRead(userId, ["test-notification-id"]);
    results.markRead = true;
    console.log("✅ Mark read test passed:", marked);
  } catch (error) {
    console.error("❌ Mark read test failed:", error.message);
  }
  
  try {
    // Test 4: Mark all as read
    console.log("\n[Test 4] Marking all notifications as read...");
    const markedAll = await markAllAsRead(userId);
    results.markAllRead = true;
    console.log("✅ Mark all read test passed:", markedAll);
  } catch (error) {
    console.error("❌ Mark all read test failed:", error.message);
  }
  
  console.log("\n=== Test Results ===");
  console.log(results);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  console.log(`\n${passedTests}/${totalTests} tests passed`);
  
  return results;
}

export default {
  NOTIFICATION_TYPES,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  createTestNotification,
  testNotificationService,
  runNotificationTests,
};
