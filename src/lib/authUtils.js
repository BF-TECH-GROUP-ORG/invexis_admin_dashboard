/**
 * In-memory token storage
 * Access token is stored ONLY in memory, not in localStorage or cookies
 * This is secure because:
 * 1. Tokens can't be accessed by XSS attacks through localStorage
 * 2. Refresh token is stored in httpOnly cookies (server-side, automatic)
 * 3. On page refresh, app restores session via refresh token cookie
 *
 * Token persists for the duration of the browser session, cleared on:
 * - Window/tab close
 * - Explicit logout
 * - App navigation/refresh (but restoreSession thunk handles this)
 */
let accessToken = null;

/**
 * Store access token in memory
 * Called by:
 * - AuthSlice.login fulfilled handler
 * - AuthSlice.restoreSession fulfilled handler
 * - Axios response interceptor after token refresh
 */
export function setToken(token) {
  accessToken = token;
  console.debug("[authUtils] Token set in memory");
}

/**
 * Retrieve access token from memory
 * Called by:
 * - Axios request interceptor to add Authorization header
 * - AuthSlice thunks to check if authenticated
 */
export function getToken() {
  return accessToken;
}

/**
 * Clear access token from memory
 * Called by:
 * - AuthSlice logout handlers
 * - Axios response interceptor on 401 (failed refresh)
 */
export function removeToken() {
  accessToken = null;
  console.debug("[authUtils] Token removed from memory");

  // Clear any legacy localStorage items from previous implementation
  if (typeof window !== "undefined") {
    localStorage.removeItem("invexis_token");
    localStorage.removeItem("invexis_refresh_token");
    localStorage.removeItem("invexis_user");
  }
}

/**
 * Check if user is currently authenticated
 * True if access token exists in memory
 */
export function isAuthenticated() {
  return !!accessToken;
}

/**
 * Legacy - Refresh token is managed by httpOnly cookie, not stored in memory
 * No-op functions kept for backwards compatibility
 */
export function setRefreshToken(token) {
  // No-op: Refresh token is in httpOnly cookie, managed by backend
  console.debug(
    "[authUtils] setRefreshToken - no-op (httpOnly cookie handled by backend)"
  );
}

export function getRefreshToken() {
  // No-op: Refresh token is in httpOnly cookie, not accessible from JS
  return null;
}

/**
 * Legacy - User state is managed by Redux, not authUtils
 * No-op function kept for backwards compatibility
 */
export function setUser(user) {
  // No-op: User state is managed by Redux store
  console.debug("[authUtils] setUser - no-op (user state in Redux)");
}

export function getUser() {
  // No-op: User state is managed by Redux store
  return null;
}
