import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/AuthSlice";
import settingsReducer from "@/features/SettingsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
  },
});

export default store;
