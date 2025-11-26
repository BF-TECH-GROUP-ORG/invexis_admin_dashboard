import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login as apiLogin, logout as apiLogout } from "@/services/AuthService";
import UserService from "@/services/UserService";
import {
  setToken,
  removeToken,
  setRefreshToken,
  getToken,
  getUser,
} from "@/lib/authUtils";

export const login = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const { data } = await apiLogin(creds);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { dispatch, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No token found");

    try {
      // Verify token validity by fetching user profile
      const { data } = await UserService.getMe();
      return { user: data, token };
    } catch (err) {
      // If network or API fails but we have a cached user in localStorage, use it as a fallback
      const cachedUser = getUser();
      if (cachedUser) {
        return { user: cachedUser, token };
      }

      removeToken();
      return rejectWithValue(
        err.response?.data || { message: "Session expired" }
      );
    }
  }
);

export const performLogout = createAsyncThunk(
  "auth/performLogout",
  async (_, { rejectWithValue }) => {
    try {
      // Call backend logout endpoint to invalidate session/token
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
    refreshToken: null,
    status: "idle",
    error: null,
    isInitialized: false,
  },
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      removeToken();
    },
    storeToken(state, action) {
      state.token = action.payload;
      setToken(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user ?? null;
        s.token = a.payload.accessToken ?? a.payload.token ?? null;
        s.refreshToken = a.payload.refreshToken ?? null;
        s.isAuthenticated = true;

        const token = a.payload.accessToken ?? a.payload.token;
        if (token) setToken(token);

        const refreshToken = a.payload.refreshToken;
        if (refreshToken) setRefreshToken(refreshToken);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload?.message ?? "Login failed";
        s.isAuthenticated = false;
      })
      .addCase(restoreSession.pending, (s) => {
        s.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;
        s.isInitialized = true;
      })
      .addCase(restoreSession.rejected, (s) => {
        s.status = "idle";
        s.user = null;
        s.token = null;
        s.isAuthenticated = false;
        s.isInitialized = true;
      })
      .addCase(performLogout.pending, (s) => {
        s.status = "loading";
      })
      .addCase(performLogout.fulfilled, (s) => {
        s.status = "idle";
        s.user = null;
        s.token = null;
        s.refreshToken = null;
        s.isAuthenticated = false;
        s.error = null;
        // Clear all auth data from localStorage
        removeToken();
      })
      .addCase(performLogout.rejected, (s) => {
        // Even on error, clear client-side state
        s.status = "idle";
        s.user = null;
        s.token = null;
        s.refreshToken = null;
        s.isAuthenticated = false;
        removeToken();
      });
  },
});

export const { logout, storeToken, setAuthData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
