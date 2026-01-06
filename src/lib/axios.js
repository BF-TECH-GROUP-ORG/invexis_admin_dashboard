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
// Session cache to prevent excessive getSession calls
let cachedSession = null;
let lastSessionFetch = 0;
const SESSION_CACHE_TTL = 5000; // 5 seconds
const PAGE_LOAD_TIME = typeof window !== "undefined" ? Date.now() : 0;

api.interceptors.request.use(
  async (config) => {
    // Skip session check for auth routes to avoid loops
    if (config.url?.includes("/auth/") && !config.url?.includes("/auth/me")) {
      return config;
    }

    if (typeof window !== "undefined") {
      config.headers = config.headers || {};

      try {
        const now = Date.now();
        // Use cached session if it's fresh enough AND not null
        const isCacheStale =
          !cachedSession || now - lastSessionFetch > SESSION_CACHE_TTL;

        if (isCacheStale) {
          const freshSession = await getSession();

          if (freshSession) {
            cachedSession = freshSession;
            lastSessionFetch = now;
          } else {
            // Session is null. If we're in the first 10s of page load, retry or don't cache.
            if (now - PAGE_LOAD_TIME < 10000) {
              console.log(
                `[Axios] Session null during warm-up for ${config.url}, retrying once...`
              );
              await new Promise((r) => setTimeout(r, 200));
              const retrySession = await getSession();

              if (retrySession) {
                cachedSession = retrySession;
                lastSessionFetch = now;
              } else {
                // Still null during warm-up: do NOT set lastSessionFetch.
                // This allows the next request to try again immediately.
                cachedSession = null;
              }
            } else {
              // Not warming up and null: user is truly logged out. Cache the null.
              cachedSession = null;
              lastSessionFetch = now;
            }
          }
        }

        if (cachedSession) {
          // If session has an error, trigger signOut immediately
          if (cachedSession.error === "RefreshAccessTokenError") {
            console.error(
              "[Axios] Session Refresh Error detected in request interceptor. (Automatic signOut disabled to prevent loop)"
            );
            return Promise.reject(new Error("Session expired"));
          }

          if (cachedSession.accessToken) {
            config.headers.Authorization = `Bearer ${cachedSession.accessToken}`;

            if (process.env.NODE_ENV === "development") {
              const token = cachedSession.accessToken;
              console.log(
                `[Axios Token Check] Token Start: "${token.substring(
                  0,
                  10
                )}..." End: "...${token.substring(token.length - 10)}"`
              );
            }
          }
        }
      } catch (error) {
        console.error(`[Axios] Interceptor error for ${config.url}:`, error);
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Axios] ${config.method?.toUpperCase()} ${config.url} (Auth: ${
            config.headers.Authorization ? "YES" : "NO"
          })`
        );
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
      const hasToken = !!originalRequest?.headers?.Authorization;
      console.warn(
        `[Axios] 401 Unauthorized for ${originalRequest?.url} (Has Token: ${hasToken})`
      );

      const isOnAuthPage =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/auth");

      if (!isOnAuthPage && hasToken) {
        // Prevent showing multiple "Session expired" notifications
        const now = Date.now();
        if (
          !window._lastAuthErrorTime ||
          now - window._lastAuthErrorTime > 5000
        ) {
          window._lastAuthErrorTime = now;
          notificationBus.emit({
            message: "Session expired. Please login again.",
            severity: "error",
          });

          console.warn(
            "[Axios] Session unauthorized. Notification shown. (Automatic signOut disabled to prevent loop)"
          );
        }
      } else if (!hasToken) {
        console.warn(
          "[Axios] Request failed with 401 but no token was present. Session might not be ready. Not signing out."
        );
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

      // Prevent flooding with the same error message
      const errorKey = `err_${msg}`;
      const now = Date.now();
      if (!window._lastErrorMap) window._lastErrorMap = {};

      if (
        !window._lastErrorMap[errorKey] ||
        now - window._lastErrorMap[errorKey] > 3000
      ) {
        window._lastErrorMap[errorKey] = now;
        notificationBus.emit({
          message: msg,
          severity: "error",
        });
      }
    }

    return Promise.reject(err);
  }
);

export default api;
