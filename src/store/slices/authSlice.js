import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/api/authService';
import { setAuthHandlers } from '../../services/utils/apiClient';
import { saveTokens, loadTokens, clearTokens, saveUser, loadUser, clearUser, notify } from '../../services/utils/authUtils';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initializing: true,
  mustVerify: false,
};

// Fast initialization - load from cache first, validate later
export const initializeAuth = createAsyncThunk('auth/initializeAuth', async (_, { rejectWithValue }) => {
  try {
    const { accessToken, refreshToken } = loadTokens();
    const user = loadUser();

    // If no tokens, return immediately
    if (!accessToken || !refreshToken) {
      return { user: null, accessToken: null, refreshToken: null, mustVerify: false };
    }

    // Return cached data immediately for fast UI rendering
    // Token validation will happen in background
    return { user, accessToken, refreshToken, mustVerify: Boolean(user && user.isEmailVerified === false) };
  } catch (e) {
    clearTokens();
    clearUser();
    return rejectWithValue(e?.response?.data || { message: 'Failed to initialize auth' });
  }
});

// Background token validation - called after UI renders
export const validateAuthToken = createAsyncThunk('auth/validateToken', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const { accessToken, refreshToken } = auth;

    if (!accessToken || !refreshToken) {
      return { user: null, accessToken: null, refreshToken: null, mustVerify: false };
    }

    try {
      await authService.validateToken();
      // If validation succeeds, optionally fetch latest user profile
      const profile = await authService.getCurrentUser();
      const user = profile?.data || profile;
      saveUser(user);
      return { user, accessToken, refreshToken, mustVerify: Boolean(user && user.isEmailVerified === false) };
    } catch {
      // Try refresh if validation fails
      const refreshResp = await authService.refreshToken(refreshToken);
      const newAccess = refreshResp?.data?.accessToken || refreshResp?.accessToken;
      if (newAccess) {
        saveTokens({ accessToken: newAccess, refreshToken });
        const profile = await authService.getCurrentUser();
        const user = profile?.data || profile;
        saveUser(user);
        return { user, accessToken: newAccess, refreshToken, mustVerify: Boolean(user && user.isEmailVerified === false) };
      } else {
        // Refresh failed, clear auth
        clearTokens();
        clearUser();
        return { user: null, accessToken: null, refreshToken: null, mustVerify: false };
      }
    }
  } catch (e) {
    clearTokens();
    clearUser();
    return rejectWithValue(e?.response?.data || { message: 'Token validation failed' });
  }
});

export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const resp = await authService.login(credentials);
    const accessToken = resp?.data?.accessToken || resp?.accessToken;
    const refreshToken = resp?.data?.refreshToken || resp?.refreshToken || null;
    const user = resp?.data?.user || resp?.user || null;
    
    if (accessToken) {
      saveTokens({ accessToken, refreshToken });
      if (user) {
        saveUser(user);
      } else {
        // Fallback: fetch user profile if not included in login response
        const profile = await authService.getCurrentUser();
        const fetchedUser = profile?.data || profile;
        saveUser(fetchedUser);
        return { accessToken, refreshToken, user: fetchedUser };
      }
    }
    
    return { accessToken, refreshToken, user };
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Login failed' });
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const resp = await authService.register(payload);
    // Don't auto-login after registration - user must verify email first
    return { raw: resp };
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Registration failed' });
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (options = {}, { rejectWithValue }) => {
  try {
    const { silent = false } = options;
    await authService.logout().catch(() => { /* best-effort: ignore error */ });
    clearTokens();
    clearUser();
    return { silent };
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Logout failed' });
  }
});

export const forgotPasswordThunk = createAsyncThunk('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    const resp = await authService.forgotPassword(payload);
    return resp;
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Request failed' });
  }
});

export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const resp = await authService.resetPassword(payload);
    return resp;
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Reset failed' });
  }
});

export const verifyEmailThunk = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    const resp = await authService.verifyEmail(token);
    // Just verify the email - don't log the user in automatically
    return resp;
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Verification failed' });
  }
});

export const resendVerificationThunk = createAsyncThunk('auth/resendVerification', async (email, { rejectWithValue, getState, dispatch }) => {
  try {
    const resp = await authService.resendVerification(email);
    return resp;
  } catch (e) {
    const errorData = e?.response?.data || { message: 'Resend failed' };
    
    // If the error indicates email is already verified, update the user state
    if (errorData.error === 'Email is already verified' || errorData.message?.includes('already verified')) {
      const state = getState();
      if (state.auth.user) {
        // Update user's email verification status
        const updatedUser = { ...state.auth.user, isEmailVerified: true };
        saveUser(updatedUser);
        
        // Dispatch an action to update the state
        dispatch(authSlice.actions.updateUserVerificationStatus({ isEmailVerified: true }));
      }
    }
    
    return rejectWithValue(errorData);
  }
});

export const refreshAccessTokenThunk = createAsyncThunk('auth/refreshToken', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const refreshToken = state.auth.refreshToken || loadTokens().refreshToken;
    if (!refreshToken) throw new Error('Missing refresh token');
    const resp = await authService.refreshToken(refreshToken);
    const newAccessToken = resp?.data?.accessToken || resp?.accessToken;
    if (!newAccessToken) throw new Error('No access token in response');
    saveTokens({ accessToken: newAccessToken, refreshToken });
    return { accessToken: newAccessToken };
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Refresh failed' });
  }
});

export const fetchProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const profile = await authService.getCurrentUser();
    const user = profile?.data || profile;
    saveUser(user);
    return user;
  } catch (e) {
    return rejectWithValue(e?.response?.data || { message: 'Failed to fetch profile' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUserVerificationStatus: (state, action) => {
      if (state.user) {
        state.user.isEmailVerified = action.payload.isEmailVerified;
        state.mustVerify = !action.payload.isEmailVerified;
      }
    },
    dismissVerification: (state) => {
      state.mustVerify = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.initializing = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const { user, accessToken, refreshToken, mustVerify } = action.payload || {};
        state.user = user || null;
        state.accessToken = accessToken || null;
        state.refreshToken = refreshToken || null;
        state.isAuthenticated = Boolean(accessToken);
        state.initializing = false;
        state.mustVerify = mustVerify !== undefined ? mustVerify : Boolean(accessToken) && (user?.isEmailVerified === false);
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        const { accessToken, refreshToken, user } = action.payload;
        state.isLoading = false;
        state.accessToken = accessToken || null;
        state.refreshToken = refreshToken || null;
        state.user = user || null;
        state.isAuthenticated = Boolean(accessToken);
        notify.success('Signed in successfully');
        state.mustVerify = Boolean(accessToken) && (user?.isEmailVerified === false);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
        
        // Try multiple paths to get the specific error message
        const errorMessage = 
          state.error?.error || 
          action.payload?.error || 
          state.error?.message || 
          action.payload?.message || 
          'Login failed';
          
        notify.error(errorMessage);
      })
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
        // Don't set any auth state - user is not logged in yet
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        notify.success('Account created successfully! Please check your email to verify your account.');
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
        notify.error(state.error?.message || 'Registration failed');
      })
      .addCase(logoutThunk.fulfilled, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.mustVerify = false;
        // Only show notification if it's not a silent logout
        const { silent } = action.payload || {};
        if (!silent) {
          notify.info('Signed out');
        }
      })
      .addCase(refreshAccessTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = Boolean(action.payload.accessToken);
      })
      .addCase(refreshAccessTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        const user = action.payload;
        state.user = user || state.user;
        state.mustVerify = Boolean(state.accessToken) && (state.user?.isEmailVerified === false);
      })
      .addCase(verifyEmailThunk.fulfilled, () => {
        // Email is verified, but user is not logged in yet
        notify.success('Email verified successfully! You can now log in.');
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        notify.error(action.payload?.message || 'Email verification failed');
      })
      .addCase(resendVerificationThunk.rejected, (state, action) => {
        // If the error indicates email is already verified, show success message
        if (action.payload?.error === 'Email is already verified' || action.payload?.message?.includes('already verified')) {
          notify.success('Email is already verified!');
        } else {
          notify.error(action.payload?.message || 'Failed to resend verification email');
        }
      })
      // Background token validation cases
      .addCase(validateAuthToken.fulfilled, (state, action) => {
        const { user, accessToken, refreshToken, mustVerify } = action.payload || {};
        // Only update if we got valid data back
        if (accessToken) {
          state.user = user || null;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken || null;
          state.isAuthenticated = Boolean(accessToken);
          state.mustVerify = mustVerify !== undefined ? mustVerify : Boolean(accessToken) && (user?.isEmailVerified === false);
        } else {
          // Token validation failed, clear auth
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.mustVerify = false;
        }
      })
      .addCase(validateAuthToken.rejected, (state, action) => {
        // Only clear auth if it's a genuine auth failure (401), not network errors
        // This prevents signing out users on temporary network issues or page reloads
        const status = action.error?.status || action.payload?.status;
        if (status === 401 || status === 403) {
          // Unauthorized - clear auth
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.mustVerify = false;
        }
        // For other errors (network, 500, etc.), keep user logged in
        // The apiClient will handle token refresh automatically
      });
  },
});

export default authSlice.reducer;

export function registerApiClientAuthHandlers(store) {
  setAuthHandlers({
    getAccessToken: () => store.getState().auth.accessToken,
    getRefreshToken: () => store.getState().auth.refreshToken,
    onRefreshToken: async () => {
      const result = await store.dispatch(refreshAccessTokenThunk());
      if (refreshAccessTokenThunk.fulfilled.match(result)) {
        return result.payload.accessToken;
      }
      throw new Error('Failed to refresh');
    },
    onLogout: () => {
      // Silent logout from apiClient (automatic, not user-initiated)
      store.dispatch(logoutThunk({ silent: true }));
    },
  });
}


