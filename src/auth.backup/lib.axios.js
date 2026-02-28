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
    // Skip session check for auth routes to avoid loops
    if (config.url?.includes("/auth/") && !config.url?.includes("/auth/me")) {
      return config;
    }

    if (typeof window !== "undefined") {
      config.headers = config.headers || {};

      try {
        // Primary: try NextAuth client helper
        const session = await getSession();

        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
          // Mark that we have attached a valid session token for this client
          try {
            if (typeof window !== "undefined") window._hadValidSession = true;
          } catch (e) {
            // ignore
          }
          if (process.env.NODE_ENV === "development") {
            const t = session.accessToken;
            console.debug(
              `[Axios Auth] Attached NextAuth token for ${config.url} (len=${t?.length || 0})`
            );
          }
        } else {
          // 1) Try localStorage fallback (set by login form) - immediate and synchronous
          try {
            const storedToken = localStorage.getItem("accessToken");
            const storedExpires = localStorage.getItem("accessTokenExpiresAt");
                if (storedToken) {
              const expiresAt = storedExpires ? parseInt(storedExpires) : 0;
              if (!expiresAt || Date.now() < expiresAt) {
                config.headers.Authorization = `Bearer ${storedToken}`;
                try {
                  if (typeof window !== "undefined") window._hadValidSession = true;
                } catch (e) {
                  // ignore
                }
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `[Axios Auth Fallback] Attached token from localStorage for ${config.url}`
                  );
                }
              } else {
                // token expired in localStorage, remove it
                localStorage.removeItem("accessToken");
                localStorage.removeItem("accessTokenExpiresAt");
              }
            }
          } catch (lsErr) {
            if (process.env.NODE_ENV === "development") {
              console.warn(`[Axios] localStorage read failed:`, lsErr);
            }
          }

          // 2) Fallback: directly fetch the session endpoint. This helps when the
          // client-side next-auth state hasn't hydrated yet immediately after
          // a server-side login action.
          try {
            // Avoid hammering the session endpoint on every request.
            if (
              !window._lastSessionFetch ||
              Date.now() - window._lastSessionFetch > 2000
            ) {
              window._lastSessionFetch = Date.now();

              const resp = await fetch("/api/auth/session", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              });

              if (resp.ok) {
                const sessionJson = await resp.json();
                if (sessionJson?.accessToken) {
                  config.headers.Authorization = `Bearer ${sessionJson.accessToken}`;
                  try {
                    if (typeof window !== "undefined") window._hadValidSession = true;
                  } catch (e) {
                    // ignore
                  }
                  // Clear localStorage fallback to avoid stale tokens
                  try {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("accessTokenExpiresAt");
                  } catch (e) {
                    // ignore
                  }

                  if (process.env.NODE_ENV === "development") {
                    const t = sessionJson.accessToken;
                    console.debug(
                      `[Axios Auth] Attached /api/auth/session token for ${config.url} (len=${t?.length || 0})`
                    );
                  }
                }
              }
            }
          } catch (fetchErr) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `[Axios] /api/auth/session fallback failed for ${config.url}:`,
                fetchErr
              );
            }
          }
        }
      } catch (error) {
        console.error(`[Axios] Interceptor error for ${config.url}:`, error);
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
      // Robustly determine if a token was present (not just header string)
      const rawAuth = originalRequest?.headers?.Authorization;
      const tokenValue = rawAuth?.split?.(" ")?.[1];
      const hasToken = !!tokenValue && tokenValue.length > 10;
      console.warn(
        `[Axios] 401 Unauthorized for ${originalRequest?.url} (Has Token: ${hasToken})`
      );

      const isOnAuthPage =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/auth");

      // Only show 'Session expired' if the client previously had a valid session
      // to avoid spurious alerts during initial hydration.
      const clientHadSession = typeof window !== "undefined" && !!window._hadValidSession;

      if (!isOnAuthPage && hasToken && clientHadSession) {
        // Prevent showing multiple "Session expired" notifications
        const now = Date.now();
          if (
          !window._lastAuthErrorTime ||
          now - window._lastAuthErrorTime > 5000
        ) {
          window._lastAuthErrorTime = now;
          // Log response body for debugging
          try {
            console.debug("[Axios] 401 response body:", err.response?.data);
          } catch (e) {}
          notificationBus.emit({
            message: "Session expired. Please login again.",
            severity: "error",
          });

          console.warn(
            "[Axios] Session unauthorized. Notification shown. (Automatic signOut disabled to prevent loop)"
          );
        }
        // Remove any localStorage fallback token to avoid repeated 401s
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("accessTokenExpiresAt");
            // Reset the had-valid flag so we don't immediately re-show the notification
            window._hadValidSession = false;
          }
        } catch (e) {
          // ignore
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
