import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initializeAuth,
  validateAuthToken,
  loginThunk,
  registerThunk,
  logoutThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  verifyEmailThunk,
  resendVerificationThunk,
} from '../store/slices/authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((s) => s.auth);

  const initialize = useCallback(() => dispatch(initializeAuth()), [dispatch]);
  const validateToken = useCallback(() => dispatch(validateAuthToken()), [dispatch]);
  const login = useCallback((c) => dispatch(loginThunk(c)), [dispatch]);
  const register = useCallback((p) => dispatch(registerThunk(p)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const forgotPassword = useCallback((p) => dispatch(forgotPasswordThunk(p)), [dispatch]);
  const resetPassword = useCallback((p) => dispatch(resetPasswordThunk(p)), [dispatch]);
  const verifyEmail = useCallback((t) => dispatch(verifyEmailThunk(t)), [dispatch]);
  const resendVerification = useCallback((e) => dispatch(resendVerificationThunk(e)), [dispatch]);

  return {
    ...authState,
    initialize,
    validateToken,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
  };
}


