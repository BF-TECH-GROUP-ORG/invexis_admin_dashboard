import axios from "axios";
import { getToken, removeToken, setToken } from "./authUtils";
import { refreshToken as apiRefreshToken } from "@/services/AuthService";

// Use NEXT_PUBLIC_API_BASE_URL when available, otherwise use local proxy
const DEFAULT_BASE = "https://granitic-jule-haunting.ngrok-free.dev/api";
const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE).replace(
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
  (config) => {
    console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);

    if (typeof window !== "undefined") {
      // Ensure headers object exists
      config.headers = config.headers || {};

      // Add access token from memory
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug("[Axios] Authorization header set");
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
 * Handles 401 Unauthorized by attempting to refresh token using httpOnly cookie
 * If refresh succeeds, retries the original request with new token
 * If refresh fails, clears auth state and redirects to login
 */
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

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

    // Handle 401 Unauthorized - try to refresh token
    if (statusCode === 401 && !originalRequest._retry) {
      if (typeof window === "undefined") {
        // Running on server - can't refresh
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          addRefreshSubscriber((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            resolve(api(originalRequest));
          });
        }).catch((err) => {
          // Refresh failed, reject this request
          return Promise.reject(err);
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        console.log("[Axios] Attempting token refresh...");
        // Call refresh endpoint (uses httpOnly cookie)
        const { data } = await apiRefreshToken();
        const newToken = data.accessToken;

        if (!newToken) {
          throw new Error("No access token returned from refresh");
        }

        // Store new token in memory
        setToken(newToken);
        api.defaults.headers.common["Authorization"] = "Bearer " + newToken;

        console.log("[Axios] Token refreshed successfully");

        // Notify all queued requests
        onRefreshed(newToken);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("[Axios] Token refresh failed", refreshErr.message);

        // Notify all queued requests of failure
        onRefreshed(null);
        isRefreshing = false;

        // Clear token and redirect to login
        removeToken();

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
