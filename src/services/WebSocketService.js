/**
 * Socket.IO Client Service
 * Provides utilities for frontend to connect to websocket service
 * WebSocket service runs on port 9002
 */

import { io } from "socket.io-client";

// WebSocket service URL - defaults to port 9002
// WebSocket service URL - defaults to port 9002
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:9002";

/**
 * Create a Socket.IO connection
 * @param {string} token - JWT authentication token
 * @param {string} userId - User ID (Required for room joining)
 * @param {object} options - Additional Socket.IO options
 * @returns {object} Socket.IO client instance
 */
export const createSocketConnection = (token, userId, options = {}) => {
  // Return null if WebSocket URL is not configured
  if (!WS_URL) {
    console.warn("WebSocket service is disabled - no server URL configured");
    return null;
  }

  const defaultOptions = {
    path: "/socket.io",
    auth: {
      token: token,
      userId: userId, // Critical for joining user room
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket"],
    ...options,
  };

  const socket = io(WS_URL, defaultOptions);

  // Connection event handlers
  socket.on("connect", () => {
    console.log("✅ Connected to WebSocket service");
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from WebSocket service:", reason);
  });

  socket.on("error", (error) => {
    console.error("⚠️ WebSocket error:", error);
  });

  socket.on("connect_error", (error) => {
    console.error("⚠️ Connection error:", error);
  });

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
  socket.emit("join", roomList);
};

/**
 * Leave one or more rooms
 * @param {object} socket - Socket.IO client instance
 * @param {string|array} rooms - Room name(s) to leave
 */
export const leaveRooms = (socket, rooms) => {
  if (!socket) return;
  const roomList = Array.isArray(rooms) ? rooms : [rooms];
  socket.emit("leave", roomList);
};

/**
 * Subscribe to user-specific events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 * @param {function} callback - Callback for events
 */
export const subscribeToUserEvents = (socket, userId, callback) => {
  if (!socket) return;
  const userRoom = `user:${userId}`;
  joinRooms(socket, userRoom);

  // Listen to all user events
  socket.on("user.registered", callback);
  socket.on("user.login", callback);
  socket.on("user.logout", callback);
  socket.on("user.updated", callback);
};

/**
 * Unsubscribe from user-specific events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 */
export const unsubscribeFromUserEvents = (socket, userId) => {
  if (!socket) return;
  const userRoom = `user:${userId}`;
  leaveRooms(socket, userRoom);

  socket.off("user.registered");
  socket.off("user.login");
  socket.off("user.logout");
  socket.off("user.updated");
};

/**
 * Subscribe to notification events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 * @param {function} callback - Callback for notifications
 */
export const subscribeToNotifications = (socket, userId, callback) => {
  if (!socket) return;
  const userRoom = `user:${userId}`;
  joinRooms(socket, userRoom);

  socket.on("notification", callback);
  socket.on("notification.read", callback);
  socket.on("notification.deleted", callback);
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

  socket.off("notification");
  socket.off("notification.read");
  socket.off("notification.deleted");
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
