import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "@/features/SettingsSlice";

const store = configureStore({
  reducer: {
    settings: settingsReducer,
  },
});

export default store;
