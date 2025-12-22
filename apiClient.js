/**
 * Enhanced API Client with Caching, Retry Logic, and Request Deduplication
 *
 * This replaces direct axios usage in services with an intelligent wrapper
 * that handles caching, retries, error transformation, and deduplication.
 */

import axios from "axios";
import api from "@/lib/axios"; // Authenticated instance
import { getSession } from "next-auth/react";

// In-memory cache (for client-side requests)
const cache = new Map();
const pendingRequests = new Map(); // For request deduplication

/**
 * Generate cache key from request config
 */
function getCacheKey(url, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${url}?${JSON.stringify(sortedParams)}`;
}

/**
 * Check if cached response is still valid
 */
function getCachedResponse(key) {
  const cached = cache.get(key);

  if (!cached) return null;

  const { data, timestamp, ttl } = cached;
  const age = Date.now() - timestamp;

  if (age < ttl) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache HIT] ${key} (age: ${Math.floor(age / 1000)}s)`);
    }
    return data;
  }

  // Expired, remove from cache
  cache.delete(key);
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache EXPIRED] ${key}`);
  }
  return null;
}

/**
 * Store response in cache
 */
function setCachedResponse(key, data, ttl) {
  if (ttl > 0) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache SET] ${key} (ttl: ${ttl / 1000}s)`);
    }
  }
}

/**
 * Transform API errors to consistent format
 */
function transformError(error) {
  // If the error is already normalized by the bottom-layer axios instance
  if (error && error.status !== undefined && error.message) {
    return error;
  }

  if (error.response) {
    return {
      message: error.response.data?.message || error.message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      message: "Network Error: No response from server. Check CORS or Backend status.",
      status: 0,
      data: null,
    };
  } else {
    return {
      message: error.message || "Request setup failed",
      status: -1,
      data: null,
    };
  }
}

/**
 * Retry logic with exponential backoff
 */
async function retryRequest(fn, retries = 1, delay = 100) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    // Don't retry on client errors (4xx) or authentication errors
    if (
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500
    ) {
      throw error;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Retry] Attempt ${4 - retries}/3 after ${delay}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Use the authenticated API instance from @/lib/axios.
 * This ensures we have the Bearer token and refresh logic.
 * 
 * Note: api already has interceptors for Auth. 
 * We add additional ones for error transformation and logging.
 */
const apiClient = api;

/**
 * Request interceptor - Add common headers (chained after auth interceptor)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add ngrok skip header if needed
    if (config.url?.includes("ngrok") || config.baseURL?.includes("ngrok")) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }

    // Add Content-Type if not set (axios usually sets this automatically for objects)
    // but explicit setting is safe.
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - Transform errors (chained after auth interceptor)
 */
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Response] ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    const transformedError = transformError(error);
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error Interceptor]", transformedError);
    }
    return Promise.reject(transformedError);
  }
);

/**
 * Enhanced GET request with caching and deduplication
 * @param {string} url - API endpoint
 * @param {Object} options - Request options
 * @param {Object} options.params - Query parameters
 * @param {Object} options.cache - Cache strategy { ttl, noStore }
 * @param {number} options.retries - Number of retry attempts (default: 3)
 * @returns {Promise<any>} Response data
 */
async function get(url, options = {}) {
  const {
    params = {},
    cache: cacheStrategy = {},
    retries = 3,
    ...axiosConfig
  } = options;
  const { ttl = 0, noStore = false } = cacheStrategy;

  // Skip cache for no-store or mutations
  if (!noStore && ttl > 0) {
    const cacheKey = getCacheKey(url, params);

    // Check cache first
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if identical request is already pending (deduplication)
    if (pendingRequests.has(cacheKey)) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Request DEDUP] ${cacheKey}`);
      }
      return pendingRequests.get(cacheKey);
    }

    // Make request
    const requestPromise = retryRequest(
      () => apiClient.get(url, { params, ...axiosConfig }),
      retries
    )
      .then((response) => {
        const data = response.data;
        setCachedResponse(cacheKey, data, ttl);
        pendingRequests.delete(cacheKey);
        return data;
      })
      .catch((error) => {
        pendingRequests.delete(cacheKey);
        throw error;
      });

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // No caching, direct request
  return retryRequest(
    () => apiClient.get(url, { params, ...axiosConfig }),
    retries
  ).then((response) => response.data);
}

/**
 * POST request (never cached)
 */
async function post(url, data, options = {}) {
  const { retries = 2, ...axiosConfig } = options;
  return retryRequest(
    () => apiClient.post(url, data, axiosConfig),
    retries
  ).then((response) => response.data);
}

/**
 * PUT request (never cached)
 */
async function put(url, data, options = {}) {
  const { retries = 3, ...axiosConfig } = options;
  return retryRequest(
    () => apiClient.put(url, data, axiosConfig),
    retries
  ).then((response) => response.data);
}

/**
 * PATCH request (never cached)
 */
async function patch(url, data, options = {}) {
  const { retries = 3, ...axiosConfig } = options;
  return retryRequest(
    () => apiClient.patch(url, data, axiosConfig),
    retries
  ).then((response) => response.data);
}

/**
 * DELETE request (never cached)
 */
async function del(url, options = {}) {
  const { retries = 1, ...axiosConfig } = options;
  return retryRequest(() => apiClient.delete(url, axiosConfig), retries).then(
    (response) => response.data
  );
}

/**
 * Clear cache manually (useful after mutations)
 * @param {string} pattern - URL pattern to match (optional, clears all if not provided)
 */
function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    if (process.env.NODE_ENV === "development") {
      console.log("[Cache CLEARED] All entries");
    }
    return;
  }

  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache CLEARED] ${cleared} entries matching "${pattern}"`);
  }
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  clearCache,

  // Expose axios instance for advanced usage
  axios: apiClient,
};
