import axios from "axios";
import { getSession } from "next-auth/react";
import { notificationBus } from "./notificationBus";

// Use NEXT_PUBLIC_API_BASE_URL when available, otherwise use local proxy
// Use NEXT_PUBLIC_API_BASE_URL when available, otherwise use local proxy
const DEFAULT_BASE = "http://localhost:8000/api";
const baseURL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE).replace(
  /\/$/,
  ""
);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // Enable credentials to send/receive cookies (refresh token, CSRF tokens)
});

/**
 * Helper function to get CSRF token from cookie
 */
const getCsrfToken = () => {
  if (typeof document === "undefined") return null;
  const name = "_csrf=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

/**
 * Request interceptor
 * Attaches access token (Bearer) and CSRF token to each request
 */
api.interceptors.request.use(
  async (config) => {
    console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);

    if (typeof window !== "undefined") {
      // Ensure headers object exists
      config.headers = config.headers || {};

      try {
        // Get session and add Authorization header
        console.log("[Axios] Fetching session...");
        const session = await getSession();

        if (session) {
          console.log("[Axios] Session found");
          if (session.accessToken) {
            console.log("[Axios] Access token found, attaching to header");
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          } else {
            console.warn("[Axios] Session exists but no accessToken found");
          }
        } else {
          console.warn("[Axios] No session found (getSession returned null)");
        }
      } catch (error) {
        console.error("[Axios] Error fetching session:", error);
      }

      // Add CSRF token for non-safe requests (POST, PUT, DELETE, PATCH)
      const csrfToken = getCsrfToken();
      if (
        csrfToken &&
        config.method &&
        !["get", "head", "options"].includes(config.method.toLowerCase())
      ) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Simplified for NextAuth - no client-side token refresh
 * 401 errors redirect to login (NextAuth middleware handles auth)
 */

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const errorCode = err.code;
    const statusCode = err.response?.status;

    // Log network errors
    if (errorCode === "ERR_NETWORK" || !err.response) {
      console.error("[Axios Network Error]", {
        code: errorCode,
        message: err.message,
        url: originalRequest?.url,
        baseURL: originalRequest?.baseURL,
        details:
          "Backend server is not responding. Check if the API server is running and ngrok tunnel is active.",
      });
      return Promise.reject(err);
    }

    // Handle 401 Unauthorized - NextAuth middleware will redirect to login
    if (statusCode === 401) {
      console.warn("[Axios] Unauthorized - session expired");
      // Optional: don't show notification for 401 if it redirects?
      // But maybe good to know session expired.
      notificationBus.emit({
        message: "Session expired. Please login again.",
        severity: "error",
      });

      // NextAuth middleware handles authentication, let it redirect
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } else if (statusCode === 403) {
      // Handle 403 Forbidden
      notificationBus.emit({
        message:
          err.response?.data?.message ||
          "You do not have permission to perform this action.",
        severity: "error",
      });
    } else if (errorCode !== "ERR_CANCELED") {
      // Generic error for others
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      notificationBus.emit({
        message: msg,
        severity: "error",
      });
    }

    return Promise.reject(err);
  }
);

export default api;
