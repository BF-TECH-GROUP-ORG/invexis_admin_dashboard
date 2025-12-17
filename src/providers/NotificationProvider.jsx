"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCheckCircle,
  HiExclamation,
  HiXCircle,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";
import { notificationBus } from "../lib/notificationBus";

const NotificationContext = createContext(null);

export function useNotification() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Default position, improved by useEffect

  // Load position from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPos = localStorage.getItem("notification_position");
      if (savedPos) {
        try {
          setPosition(JSON.parse(savedPos));
        } catch (e) {
          console.error("Failed to parse notification position", e);
        }
      } else {
        // Default to bottom-right
        // We defer this logic to the style or initial render if possible,
        // but for dragging consistency we might need specific coordinates or a fixed generic clear start.
        // For simplicity, we start at 0,0 relative to the fixed container or letting layout handle it.
        // Actually, let's just leave it as 0,0 which means "default place" effectively if we use a specific class.
      }
    }
  }, []);

  const showNotification = useCallback(
    ({ message, severity = "info", duration = 10000 }) => {
      const id = Date.now();
      setNotification({ id, message, severity, duration });

      if (duration > 0) {
        setTimeout(() => {
          setNotification((prev) => (prev?.id === id ? null : prev));
        }, duration);
      }
    },
    []
  );

  // Subscribe to global bus
  useEffect(() => {
    const unsubscribe = notificationBus.subscribe((note) => {
      showNotification(note);
    });
    return unsubscribe;
  }, [showNotification]);

  const handleClose = () => {
    setNotification(null);
  };

  const handleDragEnd = (event, info) => {
    const newPos = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    // We shouldn't strictly update 'position' state with offset repeatedly in this simple way
    // because frame-motion handles visual offset.
    // However, to persist, we need to know where it ended up related to the viewport.
    // A simpler way for a "corner" dragger is to not use layout dragging but fixed positioning.
    // BUT, Framer Motion drag is easier.
    // Let's just save the offset for next time if we render relatively.
    // Better strategy: Use a persistent X/Y offset applied to the style.

    // Actually, simple drag usually resets on unmount unless we save the validation.
    // Let's update the base position state.

    // NOTE: Framer motion `drag` naturally modifies the transform.
    // If we want next notification to appear there, we need to save it.
    // The `info.point` gives absolute coordinates.
    // But `drag` works on transform.

    // Simplified approach: Just save the transform offset (x, y).
    const currentX = position.x + info.offset.x;
    const currentY = position.y + info.offset.y;
    setPosition({ x: currentX, y: currentY });
    localStorage.setItem(
      "notification_position",
      JSON.stringify({ x: currentX, y: currentY })
    );
  };

  const getIcon = (severity) => {
    switch (severity) {
      case "success":
        return <HiCheckCircle size={28} color="#34D399" />;
      case "error":
        return <HiXCircle size={28} color="#F87171" />;
      case "warning":
        return <HiExclamation size={28} color="#FBBF24" />;
      default:
        return <HiInformationCircle size={28} color="#60A5FA" />;
    }
  };

  const getTheme = (severity) => {
    switch (severity) {
      case "success":
        return {
          bg: "#ECFDF5",
          color: "#065F46",
          border: "#34D399",
          shadow: "rgba(16, 185, 129, 0.25)",
        };
      case "error":
        return {
          bg: "#FEF2F2",
          color: "#991B1B",
          border: "#F87171",
          shadow: "rgba(239, 68, 68, 0.25)",
        };
      case "warning":
        return {
          bg: "#FFFBEB",
          color: "#92400E",
          border: "#FBBF24",
          shadow: "rgba(245, 158, 11, 0.25)",
        };
      default:
        return {
          bg: "#EFF6FF",
          color: "#1E40AF",
          border: "#60A5FA",
          shadow: "rgba(59, 130, 246, 0.25)",
        };
    }
  };

  const theme = notification ? getTheme(notification.severity) : {};

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <AnimatePresence>
        {notification && (
          <motion.div
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.8, y: 100, x: position.x }}
            animate={{ opacity: 1, scale: 1, y: position.y, x: position.x }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 9999,
              cursor: "move",
              x: position.x,
              y: position.y,
            }}
          >
            <div
              style={{
                backdropFilter: "blur(12px)",
                background: theme.bg,
                borderRadius: "24px", // XL radius
                boxShadow: `0 20px 25px -5px ${theme.shadow}, 0 10px 10px -5px ${theme.shadow}`, // Colored shadow on main div
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                minWidth: "340px",
                maxWidth: "450px",
                overflow: "hidden",
                position: "relative",
                border: "none", // Explicitly no border
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: "50%",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getIcon(notification.severity)}
                </div>

                <div style={{ flex: 1, paddingTop: "4px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: theme.color,
                      fontSize: "16px",
                      textTransform: "capitalize",
                      marginBottom: "4px",
                      fontFamily: "'Metropolis', sans-serif",
                    }}
                  >
                    {notification.severity}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: theme.color,
                      fontSize: "14px",
                      lineHeight: "1.5",
                      fontWeight: 500,
                      opacity: 0.9,
                      fontFamily: "'Metropolis', sans-serif",
                    }}
                  >
                    {notification.message}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: theme.color,
                    padding: "6px",
                    display: "flex",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.05)")
                  }
                >
                  <HiX size={20} />
                </button>
              </div>

              {/* Progress Bar */}
              {notification.duration > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "4px",
                    background: theme.color,
                    width: "100%",
                    opacity: 0.2,
                  }}
                >
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{
                      duration: notification.duration / 1000,
                      ease: "linear",
                    }}
                    style={{
                      height: "100%",
                      background: theme.color,
                      opacity: 1,
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}
