import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "@/features/SettingsSlice";
import webSocketReducer from "@/features/WebSocketSlice";
import notificationReducer from "@/features/NotificationSlice";

const store = configureStore({
  reducer: {
    settings: settingsReducer,
    webSocket: webSocketReducer,
    notifications: notificationReducer,
  },
});

export default store;
