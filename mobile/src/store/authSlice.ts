import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearAuthToken } from "../services/authService";

type User = {
  name: string;
  email: string;
  phone?: string;
  location?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    signUp(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    signOut(state) {
      state.isAuthenticated = false;
      state.user = null;
      // Best-effort token cleanup
      void clearAuthToken();
    },
    updateProfile(state, action: PayloadAction<Partial<Omit<User, "email">>>) {
      if (!state.user) return;
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
  },
});

export const { signIn, signUp, signOut, updateProfile } = authSlice.actions;
export default authSlice.reducer;


