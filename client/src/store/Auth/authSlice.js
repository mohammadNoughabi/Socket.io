// store/Auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

const initialState = {
  token: null,
  userId: null,
  username: null,
  isAuthenticated: false,

  status: "idle",

  // UI error → login/register only
  authError: null,

  // Silent check error → validateToken only (NOT shown in UI)
  globalError: null,
};

// --------------------------------------------------
// Validate Token (DO NOT show UI error on login page)
// --------------------------------------------------
export const validateTokenAsync = createAsyncThunk(
  "auth/validateToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/validate-token", {
        withCredentials: true,
      });

      if (!response.data.isAuthenticated) {
        return rejectWithValue("Not authenticated");
      }

      return {
        userId: response.data.userId,
        username: response.data.username,
        token: response.data.token,
      };
    } catch (error) {
      return rejectWithValue("Invalid token");
    }
  }
);

// --------------------------------------------------
// Login
// --------------------------------------------------
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials, {
        withCredentials: true,
      });

      return {
        userId: response.data.user.id,
        username: response.data.user.username,
        token: response.data.token,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid credentials"
      );
    }
  }
);

// --------------------------------------------------
// Register
// --------------------------------------------------
export const registerAsync = createAsyncThunk(
  "auth/register",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", credentials, {
        withCredentials: true,
      });

      return {
        userId: response.data.user.id,
        username: response.data.user.username,
        token: response.data.token,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// --------------------------------------------------
// Logout
// --------------------------------------------------
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      return true;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

// --------------------------------------------------
// Slice
// --------------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.authError = null;
    },
    clearStatus: (state) => {
      state.status = "idle";
    },
    resetAuthState: (state) => {
      state.status = "idle";
      state.authError = null;
      state.globalError = null;
    },
  },

  extraReducers: (builder) => {
    const handleAuthSuccess = (state, action) => {
      const { userId, username, token } = action.payload;

      state.status = "succeeded";
      state.isAuthenticated = true;
      state.userId = userId;
      state.username = username;
      state.token = token;

      state.authError = null;
      state.globalError = null;
    };

    const handleAuthRejected = (state, action) => {
      state.status = "failed";
      state.authError = action.payload;
      state.isAuthenticated = false;
      state.userId = null;
      state.username = null;
      state.token = null;
    };

    builder
      // -------------------------------------------------
      // Validate token (silent failure)
      // -------------------------------------------------
      .addCase(validateTokenAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(validateTokenAsync.fulfilled, handleAuthSuccess)
      .addCase(validateTokenAsync.rejected, (state, action) => {
        state.status = "idle";
        state.isAuthenticated = false;
        state.userId = null;
        state.username = null;
        state.token = null;

        // Store ONLY in silent error
        state.globalError = action.payload;
      })

      // -------------------------------------------------
      // Login
      // -------------------------------------------------
      .addCase(loginAsync.pending, (state) => {
        state.status = "loading";
        state.authError = null;
      })
      .addCase(loginAsync.fulfilled, handleAuthSuccess)
      .addCase(loginAsync.rejected, handleAuthRejected)

      // -------------------------------------------------
      // Register
      // -------------------------------------------------
      .addCase(registerAsync.pending, (state) => {
        state.status = "loading";
        state.authError = null;
      })
      .addCase(registerAsync.fulfilled, handleAuthSuccess)
      .addCase(registerAsync.rejected, handleAuthRejected)

      // -------------------------------------------------
      // Logout
      // -------------------------------------------------
      .addCase(logoutAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.status = "idle";
        state.isAuthenticated = false;
        state.userId = null;
        state.username = null;
        state.token = null;
        state.authError = null;
        state.globalError = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.status = "idle";
        state.isAuthenticated = false;
        state.userId = null;
        state.token = null;
        state.authError = null;
      });
  },
});

export const { clearError, clearStatus, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
