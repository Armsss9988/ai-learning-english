import { User } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: Partial<User> | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Helper functions for localStorage operations
const loadAuthFromStorage = (): Partial<AuthState> => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, loading: true };
  }

  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        isAuthenticated: true,
        loading: false,
      };
    }
  } catch (error) {
    console.error("Error loading auth from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  
  return { user: null, isAuthenticated: false, loading: false };
};

const saveAuthToStorage = (user: Partial<User> | null, token?: string) => {
  if (typeof window === 'undefined') return;

  try {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.error("Error saving auth to localStorage:", error);
  }
};

// Load initial state from localStorage
const persistedAuth = loadAuthFromStorage();

const initialState: AuthState = {
  user: persistedAuth.user || null,
  isAuthenticated: persistedAuth.isAuthenticated || false,
  loading: persistedAuth.loading !== false, // Default to true if not set
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User; token: string } | null>
    ) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        
        // Save to localStorage
        saveAuthToStorage(action.payload.user, action.payload.token);
      } else {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        
        // Clear localStorage
        saveAuthToStorage(null);
      }
    },
    
    hydrate: (state) => {
      // Restore state from localStorage
      const persistedAuth = loadAuthFromStorage();
      state.user = persistedAuth.user || null;
      state.isAuthenticated = persistedAuth.isAuthenticated || false;
      state.loading = false;
    },
    
    verify: (state) => {
      // Legacy method - now just calls hydrate logic
      const persistedAuth = loadAuthFromStorage();
      state.user = persistedAuth.user || null;
      state.isAuthenticated = persistedAuth.isAuthenticated || false;
      state.loading = false;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Clear localStorage
      saveAuthToStorage(null);
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update localStorage with current token
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (token) {
          saveAuthToStorage(state.user, token);
        }
      }
    },
  },
});

export const { setUser, setLoading, logout, verify, hydrate, updateUser } = authSlice.actions;
export default authSlice.reducer;
