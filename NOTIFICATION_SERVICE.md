# 🔔 Notification Service Integration Guide

## Base URL
```
/api/notification
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### 1. Get User Notifications

**Endpoint:** `GET /notification/:userId` or `GET /notification/`

**Query Parameters:**
- `page` (default: 1) - Page number for pagination
- `limit` (default: 50) - Items per page
- `unreadOnly` (boolean) - Set to true to fetch only unread items
- `role` (optional) - Filter by user role (e.g., 'admin')
- `companyId` (optional) - Filter notifications specific to a company context

**Example Request:**
```http
GET /api/notification/user123?unreadOnly=true&page=1&limit=50
Authorization: Bearer <token>
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "675ae...",
        "title": "Stock Alert",
        "body": "Inventory for 'Milk' is low (10 units left).",
        "type": "inventory_alert",
        "priority": "high",
        "readBy": [],
        "createdAt": "2024-12-16T10:00:00.000Z",
        "payload": { 
          "productId": "123", 
          "currentStock": 10 
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pages": 1
    }
  }
}
```

---

### 2. Mark Notifications as Read

**Endpoint:** `POST /notification/mark-read`

**Case A: Mark Specific Items**
```json
{
  "userId": "user123",
  "notificationIds": ["675ae...", "675af..."]
}
```

**Case B: Mark All as Read**
```json
{
  "userId": "user123",
  "all": true
}
```

**Response:**
```json
{
  "success": true,
  "updated": 2
}
```

---

### 3. Create Notification (Admin/Testing)

**Endpoint:** `POST /notification/`

**Body Payload:**
```json
{
  "type": "custom_alert",
  "recipient": "userId_123",
  "companyId": "company_456",
  "message": {
    "title": "System Update",
    "body": "Maintenance scheduled for midnight."
  },
  "data": { 
    "version": "2.0" 
  },
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "notification": {
    "_id": "675ae...",
    "type": "custom_alert",
    "title": "System Update",
    "body": "Maintenance scheduled for midnight.",
    "createdAt": "2024-12-18T15:30:00.000Z"
  }
}
```

---

## 🎨 Frontend Implementation

### Redux Integration

The notification system uses Redux Toolkit for state management:

```javascript
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  selectNotifications,
  selectUnreadCount,
} from "@/features/NotificationSlice";

// In your component
const dispatch = useDispatch();
const notifications = useSelector(selectNotifications);
const unreadCount = useSelector(selectUnreadCount);

// Fetch notifications
dispatch(fetchNotificationsThunk({
  userId: user.id,
  options: { unreadOnly: true, limit: 50 }
}));

// Mark as read
dispatch(markAsReadThunk({
  userId: user.id,
  notificationIds: ["id1", "id2"]
}));

// Mark all as read
dispatch(markAllAsReadThunk({ userId: user.id }));
```

### UI Components

#### Bell Icon with Badge
```jsx
import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUnreadCount } from "@/features/NotificationSlice";

function NotificationBell() {
  const unreadCount = useSelector(selectUnreadCount);
  
  return (
    <button className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

#### Notification List Item
```jsx
function NotificationItem({ notification, onMarkRead }) {
  const getIcon = (type) => {
    const icons = {
      inventory_alert: "📦",
      payment_success: "💳",
      order_placed: "🛒",
      system_update: "⚙️",
    };
    return icons[type] || "🔔";
  };

  const getColor = (priority) => {
    const colors = {
      high: "border-red-200 bg-red-50",
      normal: "border-blue-200 bg-blue-50",
      low: "border-gray-200 bg-gray-50",
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className={`p-4 rounded-lg border ${getColor(notification.priority)}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon(notification.type)}</span>
        <div className="flex-1">
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm text-gray-600">{notification.body}</p>
          <span className="text-xs text-gray-400">{notification.time}</span>
        </div>
        {notification.unread && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Mark Read
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing the Service

### Using the Test Utility

```javascript
import notificationTester from "@/utils/notificationTester";

// Test service health
const isHealthy = await notificationTester.testNotificationService();

// Run comprehensive tests
const results = await notificationTester.runNotificationTests(
  "user123",
  "company456"
);

// Create test notification
await notificationTester.createTestNotification(
  "user123",
  "company456",
  notificationTester.NOTIFICATION_TYPES.INVENTORY_ALERT
);
```

### Manual Testing via Browser Console

```javascript
// Open browser console on your dashboard

// Test 1: Fetch notifications
fetch('/api/notification/YOUR_USER_ID?limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(r => r.json()).then(console.log);

// Test 2: Mark as read
fetch('/api/notification/mark-read', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    notificationIds: ['NOTIFICATION_ID']
  })
}).then(r => r.json()).then(console.log);
```

---

## 🔄 WebSocket Integration (Future)

For real-time notifications, the system supports WebSocket connections:

```javascript
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "@/features/NotificationSlice";
import io from "socket.io-client";

function useNotificationWebSocket(userId) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on("connect", () => {
      socket.emit("subscribe", { userId });
    });

    socket.on("notification", (notification) => {
      dispatch(addNotification({ notification, userId }));
    });

    return () => socket.disconnect();
  }, [userId, dispatch]);
}
```

---

## 📊 Notification Types

| Type | Icon | Priority | Use Case |
|------|------|----------|----------|
| `inventory_alert` | 📦 | High | Low stock warnings |
| `payment_success` | 💳 | Normal | Payment confirmations |
| `order_placed` | 🛒 | Normal | New order alerts |
| `system_update` | ⚙️ | Low | System maintenance |
| `user_registered` | 👤 | Normal | New user signups |
| `custom_alert` | 🔔 | Normal | Generic notifications |

---

## 🎯 Best Practices

1. **Polling Interval**: Fetch notifications every 30-60 seconds for unread count
2. **Pagination**: Use `limit=50` for initial load, implement infinite scroll
3. **Filtering**: Allow users to filter by type, priority, or date
4. **Mark as Read**: Auto-mark when notification is clicked/expanded
5. **Persistence**: Use Redux Persist to cache notifications offline
6. **Error Handling**: Show user-friendly messages for network errors
7. **Loading States**: Display skeleton loaders during fetch

---

## 🐛 Troubleshooting

### Issue: Notifications not loading
**Solution:**
1. Check API base URL in `.env`
2. Verify authentication token is valid
3. Check browser console for CORS errors
4. Ensure backend notification service is running

### Issue: Unread count not updating
**Solution:**
1. Verify `markAsRead` API call succeeds
2. Check Redux state is updating correctly
3. Ensure `readBy` array includes current user ID

### Issue: WebSocket not connecting
**Solution:**
1. Verify WebSocket URL is correct
2. Check firewall/proxy settings
3. Ensure backend WebSocket server is running
4. Check browser console for connection errors

---

## 📚 Related Files

- **Redux Slice**: `src/features/NotificationSlice.js`
- **Service Layer**: `src/services/NotificationService.js`
- **UI Page**: `src/components/pages/NotificationsPage.jsx`
- **Test Utility**: `src/utils/notificationTester.js`
- **API Client**: `apiClient.js`

---

## 🚀 Next Steps

1. ✅ Implement notification preferences (email, push, in-app)
2. ✅ Add notification categories/tags
3. ✅ Implement notification search
4. ✅ Add notification archiving
5. ✅ Create notification analytics dashboard
