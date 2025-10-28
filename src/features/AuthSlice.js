import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login as apiLogin } from "@/services/AuthService";
import { setToken, removeToken } from "@/lib/authUtils";

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

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, status: "idle", error: null },
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.token;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
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

        const token = a.payload.accessToken ?? a.payload.token;
        if (token) setToken(token);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload?.message ?? "Login failed";
      });
  },
});

export const { logout, storeToken, setAuthData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
