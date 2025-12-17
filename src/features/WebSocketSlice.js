import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connectionStatus: "disconnected", // 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  reconnectAttempts: 0,
  error: null,
};

const webSocketSlice = createSlice({
  name: "webSocket",
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
      if (action.payload === "connected") {
        state.lastConnectedAt = new Date().toISOString();
        state.reconnectAttempts = 0;
        state.error = null;
      } else if (action.payload === "disconnected") {
        state.lastDisconnectedAt = new Date().toISOString();
      }
    },
    setConnecting: (state) => {
      state.connectionStatus = "connecting";
    },
    setConnected: (state) => {
      state.connectionStatus = "connected";
      state.lastConnectedAt = new Date().toISOString();
      state.reconnectAttempts = 0;
      state.error = null;
    },
    setDisconnected: (state) => {
      state.connectionStatus = "disconnected";
      state.lastDisconnectedAt = new Date().toISOString();
    },
    setReconnecting: (state) => {
      state.connectionStatus = "reconnecting";
      state.reconnectAttempts += 1;
    },
    setError: (state, action) => {
      state.connectionStatus = "error";
      state.error = action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  setConnectionStatus,
  setConnecting,
  setConnected,
  setDisconnected,
  setReconnecting,
  setError,
  resetState,
} = webSocketSlice.actions;

// Selectors
export const selectConnectionStatus = (state) =>
  state.webSocket.connectionStatus;
export const selectIsConnected = (state) =>
  state.webSocket.connectionStatus === "connected";
export const selectWebSocketError = (state) => state.webSocket.error;
export const selectReconnectAttempts = (state) =>
  state.webSocket.reconnectAttempts;

export default webSocketSlice.reducer;

