import axios from "axios";
import { getSession, signOut } from "next-auth/react";
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
    // Skip session check for public auth routes and NextAuth internal routes to avoid loops
    // Authenticated backend routes like /auth/users/... should still get the token
    const isPublicAuthRoute = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ].some((path) => config.url?.includes(path));

    const isNextAuthInternal = config.url?.includes("/api/auth/");

    if ((isPublicAuthRoute || isNextAuthInternal) && !config.url?.includes("/auth/me")) {
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
          // Fallback: directly fetch the NextAuth session endpoint if
          // the client helper doesn't yet have the token. We use a short
          // cooldown to avoid calling this on every request.
          try {
            if (!window._lastSessionFetch || Date.now() - window._lastSessionFetch > 2000) {
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
              console.warn(`[Axios] /api/auth/session fallback failed for ${config.url}:`, fetchErr);
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
      if (process.env.NODE_ENV === "development") {
        console.error("[Axios Network Error]", {
          code: errorCode,
          message: err.message,
          url: originalRequest?.url,
          details: "Backend server is not responding.",
        });
      }
      return Promise.reject(err);
    }

    // Hard stop: never retry refresh endpoint to avoid infinite loops
    if (originalRequest?.url?.includes("/auth/refresh")) {
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/auth/login" });
      }
      return Promise.reject(err);
    }

    // Handle 401 Unauthorized - Attempt refresh if not already retried
    if (statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (process.env.NODE_ENV === "development") {
        console.warn(`[Axios] 401 Unauthorized for ${originalRequest.url}. Attempting to refresh session...`);
      }

      try {
        // Force refresh the session by calling the auth session endpoint
        const resp = await fetch("/api/auth/session?update", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (resp.ok) {
          const sessionJson = await resp.json();
          if (sessionJson?.accessToken) {
            // Update the authorization header and retry the request
            originalRequest.headers.Authorization = `Bearer ${sessionJson.accessToken}`;

            if (process.env.NODE_ENV === "development") {
              console.log(`[Axios] Session refreshed, retrying ${originalRequest.url}`);
            }

            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Axios] Session refresh failed during 401 retry:", refreshErr);
        }
      }

      // If refresh failed or no token received, proceed with normal 401 handling
      const rawAuth = originalRequest?.headers?.Authorization;
      const hasToken = !!rawAuth && rawAuth.length > 15;

      const isOnAuthPage = typeof window !== "undefined" && window.location.pathname.startsWith("/auth");
      const clientHadSession = typeof window !== "undefined" && !!window._hadValidSession;

      if (!isOnAuthPage && hasToken && clientHadSession) {
        if (typeof window !== "undefined") {
          window._hadValidSession = false;
          signOut({ callbackUrl: "/auth/login" });
        }
      }
    } else if (statusCode === 403) {
      notificationBus.emit({
        message: err.response?.data?.message || "You do not have permission to perform this action.",
        severity: "error",
      });
    } else if (errorCode !== "ERR_CANCELED") {
      // Generic error handling
      const msg = err.response?.data?.message || err.message || "An unexpected error occurred.";
      const errorKey = `err_${msg}`;
      const now = Date.now();
      if (!window._lastErrorMap) window._lastErrorMap = {};

      if (!window._lastErrorMap[errorKey] || now - window._lastErrorMap[errorKey] > 3000) {
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
