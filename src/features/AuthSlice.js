import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login as apiLogin,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  getMe as apiGetMe,
} from "@/services/AuthService";
import { setToken, removeToken, getToken } from "@/lib/authUtils";

/**
 * Login thunk - handles user login and stores token/user in Redux
 * Expected response: { ok: true, accessToken, user: {...} }
 * Can also handle 204 No Content responses where token is in header
 */
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("[AuthSlice] Login attempt with credentials:", {
        identifier: credentials.identifier,
        hasPassword: !!credentials.password,
      });

      const response = await apiLogin(credentials);
      console.log("[AuthSlice] Login response received:", {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        ok: response.data?.ok,
        hasAccessToken: !!response.data?.accessToken,
        hasUser: !!response.data?.user,
      });

      // Extract token from response body
      let token = response.data?.accessToken;
      let user = response.data?.user;

      console.log("[AuthSlice] Extracted from response:", {
        token: token ? `${token.substring(0, 20)}...` : null,
        userId: user?._id,
        userEmail: user?.email,
      });

      // Validate we have a token
      if (!token) {
        console.error("[AuthSlice] No access token in response", {
          responseData: response.data,
        });
        return rejectWithValue({
          message: "No access token returned from login",
        });
      }

      console.log("[AuthSlice] Login successful with token and user data", {
        hasToken: !!token,
        hasUser: !!user,
      });

      // Store token in memory (not localStorage)
      setToken(token);
      console.log("[AuthSlice] Token stored in memory, isAuthenticated:", {
        tokenStored: !!token,
      });

      // If we don't have user data after login, fetch it using the new token
      if (!user) {
        console.log(
          "[AuthSlice] No user data in response, attempting to fetch user profile"
        );
        try {
          const userResponse = await apiGetMe();
          user = userResponse.data.user || userResponse.data;
          console.log("[AuthSlice] Fetched user profile:", {
            userId: user._id,
            firstName: user.firstName,
            role: user.role,
          });
        } catch (fetchErr) {
          console.warn(
            "[AuthSlice] Could not fetch user profile after login:",
            fetchErr.message
          );
          // If we can't fetch user, that's not a hard failure - we have the token
          // The app can still work with just a token (protected routes will validate)
        }
      }

      console.log("[AuthSlice] Returning login success payload:", {
        hasToken: !!token,
        hasUser: !!user,
        userId: user?._id,
        userEmail: user?.email,
      });

      return { token, user: user || null };
    } catch (err) {
      console.error("[AuthSlice] Login error:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        code: err.code,
        isNetworkError: !err.response,
      });

      // Better error message extraction
      let message = "Login failed";

      if (!err.response && err.code === "ERR_NETWORK") {
        // Network error - backend not responding
        message =
          "Unable to connect to server. Please check your internet connection or try again later.";
      } else if (!err.response) {
        // Network or other error without response
        message =
          err.message ||
          "Network error - please check your internet connection";
      } else if (err.response) {
        // Server responded with error
        message =
          err.response.data?.message ||
          err.response.data?.error ||
          err.response.statusText ||
          `Server error (${err.response.status})`;
      } else if (err.message) {
        // Generic error
        message = err.message;
      }

      return rejectWithValue({ message });
    }
  }
);

/**
 * Session restoration thunk - called on app initialization
 * Uses refresh token in httpOnly cookie to get a new access token
 * Then fetches current user profile
 */
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      // First, try to refresh the token using httpOnly cookie
      const refreshResponse = await apiRefreshToken();
      const newToken = refreshResponse.data.accessToken;

      if (!newToken) {
        return rejectWithValue({ message: "No token from refresh" });
      }

      // Store the new token in memory
      setToken(newToken);

      // Now fetch the current user profile
      const userResponse = await apiGetMe();
      const user = userResponse.data.user || userResponse.data;

      return { token: newToken, user };
    } catch (err) {
      // If refresh fails, user is not authenticated
      removeToken();
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

/**
 * Logout thunk - clears session on both backend and frontend
 */
export const performLogout = createAsyncThunk(
  "auth/performLogout",
  async (_, { rejectWithValue }) => {
    try {
      // Call backend logout endpoint to invalidate session
      await apiLogout();
      return { success: true };
    } catch (err) {
      // Log the error but don't fail the logout on client side
      console.error(
        "Backend logout failed, clearing local state anyway:",
        err.message
      );
      return { success: true }; // Still proceed with client-side logout
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    status: "idle", // idle, loading, succeeded, failed
    error: null,
    isInitialized: false,
  },
  reducers: {
    /**
     * Manually set auth data (rarely used, prefer thunks)
     */
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.token;
      setToken(action.payload.token);
    },
    /**
     * Clear auth data
     */
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      removeToken();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Login failed";
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.isInitialized = true;
      })

      // Session restoration cases
      .addCase(restoreSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
      })

      // Logout cases
      .addCase(performLogout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = false;
        removeToken();
      })
      .addCase(performLogout.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = false;
        removeToken();
      });
  },
});

export const { setAuthData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
