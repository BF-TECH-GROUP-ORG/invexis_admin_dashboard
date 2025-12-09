import axios from "axios";

// Use NEXT_PUBLIC_API_BASE_URL when available, otherwise use local proxy
const DEFAULT_BASE ="https://granitic-jule-haunting.ngrok-free.dev/api";
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
  (config) => {
    console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);

    if (typeof window !== "undefined") {
      // Ensure headers object exists
      config.headers = config.headers || {};

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
      // NextAuth middleware handles authentication, let it redirect
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
