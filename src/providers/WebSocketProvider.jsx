"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import {
  createSocketConnection,
  disconnect,
  isConnected,
  joinRooms,
  leaveRooms,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  subscribeToUserEvents,
  unsubscribeFromUserEvents,
  subscribeToRoom,
  unsubscribeFromRoom,
  emitEvent,
} from "@/services/WebSocketService";
import {
  setConnecting,
  setConnected,
  setDisconnected,
  setReconnecting,
  setError,
  resetState,
} from "@/features/WebSocketSlice";
import { addNotification } from "@/features/NotificationSlice";
import { notificationBus } from "@/lib/notificationBus";

// Create WebSocket context
const WebSocketContext = createContext(null);

/**
 * WebSocket Provider Component
 * Manages global socket connection and provides socket utilities
 */
export function WebSocketProvider({ children }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const socketRef = useRef(null);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    // Only connect when session is authenticated and has access token
    if (status === "authenticated" && session?.accessToken) {
      // Avoid duplicate connections
      if (socketRef.current?.connected) {
        return;
      }

      console.log("[WebSocket] Initializing connection...");
      dispatch(setConnecting());
      // FIXED: Use session.user._id instead of .id
      const newSocket = createSocketConnection(process.env.NEXT_PUBLIC_WS_URL, session.accessToken, session.user?._id);


      // If socket is null (disabled), don't proceed with connection setup
      if (!newSocket) {
        console.log("[WebSocket] Service disabled - skipping connection");
        dispatch(setDisconnected());
        return;
      }

      // Track connection status
      newSocket.on("connect", () => {
        setConnectionStatus("connected");
        dispatch(setConnected());
        console.log("[WebSocket] Connected successfully");
      });

      newSocket.on("disconnect", (reason) => {
        setConnectionStatus("disconnected");
        dispatch(setDisconnected());
        console.log("[WebSocket] Disconnected:", reason);
      });

      newSocket.on("connect_error", (error) => {
        setConnectionStatus("error");
        dispatch(setError(error.message));
        console.error("[WebSocket] Connection error:", error.message);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        setConnectionStatus("reconnecting");
        dispatch(setReconnecting());
        console.log("[WebSocket] Reconnect attempt:", attemptNumber);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Cleanup on unmount or session change
      return () => {
        console.log("[WebSocket] Cleaning up connection...");
        if (socketRef.current) {
          disconnect(socketRef.current);
          socketRef.current = null;
          setSocket(null);
          setConnectionStatus("disconnected");
          dispatch(resetState());
        }
      };
    }

    // Disconnect if session is lost
    if (status === "unauthenticated" && socketRef.current) {
      console.log("[WebSocket] Session lost, disconnecting...");
      dispatch(resetState());
      disconnect(socketRef.current);
      socketRef.current = null;
      setSocket(null);
      setConnectionStatus("disconnected");
    }
  }, [status, session?.accessToken, session?.user?._id, dispatch]);

  // Global Notification Subscription
  useEffect(() => {
    // FIXED: Use session.user._id
    if (socket && session?.user?._id) {
      console.log("[WebSocket] Subscribing to user notifications:", session.user._id);

      const handleNotification = (data) => {
        console.log("[WebSocket] Received notification:", data);
        dispatch(addNotification({ notification: data, userId: session.user._id }));

        // Also emit to the bus for toast
        notificationBus.emit({
          message: data.title || "New Notification",
          severity: "info",
          duration: 5000
        });
      };

      subscribeToNotifications(socket, session.user._id, handleNotification);

      return () => {
        unsubscribeFromNotifications(socket, session.user._id);
      };
    }
  }, [socket, session?.user?._id, dispatch]);

  // Helper to subscribe to notifications for current user
  const subscribeNotifications = useCallback(
    (callback) => {
      if (socket && session?.user?._id) {
        subscribeToNotifications(socket, session.user._id, callback);
      }
    },
    [socket, session?.user?._id]
  );

  // Helper to unsubscribe from notifications
  const unsubscribeNotifications = useCallback(() => {
    if (socket && session?.user?._id) {
      unsubscribeFromNotifications(socket, session.user._id);
    }
  }, [socket, session?.user?._id]);

  // Helper to subscribe to user events
  const subscribeUserEvents = useCallback(
    (callback) => {
      if (socket && session?.user?._id) {
        subscribeToUserEvents(socket, session.user._id, callback);
      }
    },
    [socket, session?.user?._id]
  );

  // Helper to unsubscribe from user events
  const unsubscribeUserEvents = useCallback(() => {
    if (socket && session?.user?._id) {
      unsubscribeFromUserEvents(socket, session.user._id);
    }
  }, [socket, session?.user?._id]);

  // Context value
  const value = {
    socket,
    connectionStatus,
    isConnected: connectionStatus === "connected",
    // Room utilities
    joinRooms: (rooms) => joinRooms(socket, rooms),
    leaveRooms: (rooms) => leaveRooms(socket, rooms),
    // Subscription utilities
    subscribeToRoom: (roomName, callback) =>
      subscribeToRoom(socket, roomName, callback),
    unsubscribeFromRoom: (roomName) => unsubscribeFromRoom(socket, roomName),
    subscribeNotifications,
    unsubscribeNotifications,
    subscribeUserEvents,
    unsubscribeUserEvents,
    // Event utilities
    emit: (eventName, data) => emitEvent(socket, eventName, data),
    // Direct event listener management
    on: (event, callback) => socket?.on(event, callback),
    off: (event, callback) => socket?.off(event, callback),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to access WebSocket context
 * @returns {object} WebSocket context value
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

export default WebSocketProvider;
