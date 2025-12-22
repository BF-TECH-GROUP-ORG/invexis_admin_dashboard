/**
 * Socket.IO Client Service
 * Provides utilities for frontend to connect to websocket service
 */

import { io } from "socket.io-client";

/**
 * Create a Socket.IO connection through the gateway
 * @param {string} gatewayUrl - Gateway URL (e.g., 'http://localhost:3000')
 * @param {string} token - JWT authentication token
 * @param {object} options - Additional Socket.IO options
 * @returns {object} Socket.IO client instance
 */
export const createSocketConnection = (gatewayUrl, token, userId, options = {}) => {
  const defaultOptions = {
    path: '/socket.io',
    auth: {
      token: token,
      userId: userId,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['polling', 'websocket'], // Supported transports (polling first for better compatibility)
    extraHeaders: {
      "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
    },
    ...options,
  };

  // Resolve URL
  let rawUrl = gatewayUrl || process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:9002";

  // Sanitize URL to remove path/namespaces that might be inadvertently included (e.g. /api)
  // This prevents 'Invalid namespace' errors if the user copy-pasted an API URL
  let url = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    // Keep only origin (protocol + host + port), discard pathname (namespace)
    url = parsed.origin;
  } catch (e) {
    console.warn("Invalid WebSocket URL format:", rawUrl);
  }

  const socket = io(url, defaultOptions);

  // Note: Connection event handlers are now managed by the consumer (WebSocketProvider)
  // to avoid duplicate logging.

  return socket;
};

/**
 * Join one or more rooms
 * @param {object} socket - Socket.IO client instance
 * @param {string|array} rooms - Room name(s) to join
 */
export const joinRooms = (socket, rooms) => {
  if (!socket) return;
  const roomList = Array.isArray(rooms) ? rooms : [rooms];
  console.log(`[WebSocket] 🟢 Joining room(s):`, roomList);
  socket.emit('join_room', roomList);
};

/**
 * Leave one or more rooms
 * @param {object} socket - Socket.IO client instance
 * @param {string|array} rooms - Room name(s) to leave
 */
export const leaveRooms = (socket, rooms) => {
  if (!socket) return;
  const roomList = Array.isArray(rooms) ? rooms : [rooms];
  console.log(`[WebSocket] 🔴 Leaving room(s):`, roomList);
  socket.emit('leave_room', roomList);
};

/**
 * Subscribe to user-specific events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 * @param {function} callback - Callback for events
 */
export const subscribeToUserEvents = (socket, userId, callback) => {
  if (!socket) return;
  console.log(`[WebSocket] 🎧 Subscribing to user events for: ${userId}`);
  const userRoom = `user:${userId}`;
  joinRooms(socket, userRoom);

  // Listen to all user events
  socket.on('user.registered', (data) => {
    console.log(`[WebSocket] 📩 Event 'user.registered':`, data);
    callback(data);
  });
  socket.on('user.login', (data) => {
    console.log(`[WebSocket] 📩 Event 'user.login':`, data);
    callback(data);
  });
  socket.on('user.logout', (data) => {
    console.log(`[WebSocket] 📩 Event 'user.logout':`, data);
    callback(data);
  });
  socket.on('user.updated', (data) => {
    console.log(`[WebSocket] 📩 Event 'user.updated':`, data);
    callback(data);
  });
};

/**
 * Unsubscribe from user-specific events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 */
export const unsubscribeFromUserEvents = (socket, userId) => {
  if (!socket) return;
  console.log(`[WebSocket] 🔇 Unsubscribing from user events: ${userId}`);
  const userRoom = `user:${userId}`;
  leaveRooms(socket, userRoom);

  socket.off('user.registered');
  socket.off('user.login');
  socket.off('user.logout');
  socket.off('user.updated');
};

/**
 * Subscribe to notification events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 * @param {function} callback - Callback for notifications
 */
export const subscribeToNotifications = (socket, userId, callback) => {
  if (!socket) return;
  console.log(`[WebSocket] 🎧 Subscribing to notifications for: ${userId}`);
  const userRoom = `user:${userId}`;
  joinRooms(socket, userRoom);

  socket.on('notification', (data) => {
    console.log(`[WebSocket] 🔔 New Notification Received:`, data);
    callback(data);
  });
  socket.on('notification.read', (data) => {
    console.log(`[WebSocket] 📖 Notification Read:`, data);
    callback(data); // You might want a separate callback or handle this differently in the provider
  });
  socket.on('notification.deleted', (data) => {
    console.log(`[WebSocket] 🗑️ Notification Deleted:`, data);
    callback(data);
  });
};

/**
 * Unsubscribe from notification events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 */
export const unsubscribeFromNotifications = (socket, userId) => {
  if (!socket) return;
  const userRoom = `user:${userId}`;
  leaveRooms(socket, userRoom);

  socket.off('notification');
  socket.off('notification.read');
  socket.off('notification.deleted');
};

/**
 * Subscribe to room events
 * @param {object} socket - Socket.IO client instance
 * @param {string} roomName - Room name
 * @param {function} callback - Callback for room events
 */
export const subscribeToRoom = (socket, roomName, callback) => {
  if (!socket) return;
  joinRooms(socket, roomName);
  socket.on(roomName, callback);
};

/**
 * Unsubscribe from room events
 * @param {object} socket - Socket.IO client instance
 * @param {string} roomName - Room name
 */
export const unsubscribeFromRoom = (socket, roomName) => {
  if (!socket) return;
  leaveRooms(socket, roomName);
  socket.off(roomName);
};

/**
 * Emit custom event
 * @param {object} socket - Socket.IO client instance
 * @param {string} eventName - Event name
 * @param {object} data - Event data
 */
export const emitEvent = (socket, eventName, data) => {
  if (!socket) return;
  socket.emit(eventName, data);
};

/**
 * Disconnect socket
 * @param {object} socket - Socket.IO client instance
 */
export const disconnect = (socket) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

/**
 * Check if socket is connected
 * @param {object} socket - Socket.IO client instance
 * @returns {boolean}
 */
export const isConnected = (socket) => {
  return socket?.connected || false;
};
