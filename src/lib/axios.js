import axios from "axios";
import { getToken, removeToken, getRefreshToken, setToken } from "./authUtils";
import { refreshToken } from "@/services/AuthService";

// Use NEXT_PUBLIC_API_BASE_URL when available, otherwise use local proxy
const DEFAULT_BASE = "/api";
// const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE).replace(
//   /\/$/,
//   ""
// );
const baseURL = DEFAULT_BASE;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // Enable credentials to send/receive cookies (CSRF tokens)
});

// Helper function to get CSRF token from cookie
const getCsrfToken = () => {
  if (typeof document === 'undefined') return null;
  const name = '_csrf=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

// Attach token and CSRF token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Add authentication token
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET requests (POST, PUT, DELETE, PATCH)
    const csrfToken = getCsrfToken();
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken;
      config.headers['CSRF-Token'] = csrfToken; // Some backends expect this header name
    }
  }
  return config;
});

// Response interceptor to handle 401 and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 and not already retrying
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === "undefined") {
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const rToken = getRefreshToken();

      if (!rToken) {
        // No refresh token, logout
        removeToken();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      }

      try {
        const { data } = await refreshToken(rToken);
        const newToken = data.accessToken || data.token;
        
        setToken(newToken);
        api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        
        processQueue(null, newToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        removeToken();
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
