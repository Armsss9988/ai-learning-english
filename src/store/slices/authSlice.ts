import { User } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: Partial<User> | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User; token: string } | null>
    ) => {
      state.user = action.payload?.user || null;
      state.isAuthenticated = !!action.payload?.user;
      localStorage.setItem("token", action.payload?.token || "");
      state.loading = false;
    },
    verify: (state) => {
      if (localStorage.getItem("token"))
        state.user = JSON.parse(localStorage.getItem("user") || "{}");
      state.isAuthenticated = localStorage.getItem("token") ? true : false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, logout, verify } = authSlice.actions;
export default authSlice.reducer;
