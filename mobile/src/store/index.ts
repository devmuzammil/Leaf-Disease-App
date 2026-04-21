import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import preferencesReducer from "./preferencesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


