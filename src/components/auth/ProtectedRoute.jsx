import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';

const hasRequiredRole = (user, roles) => {
  if (!roles || roles.length === 0) return true;
  const userRoles = user?.roles || user?.authorities || [];
  const list = Array.isArray(userRoles) ? userRoles : [userRoles];
  return roles.some((r) => list.includes(r) || list.some((x) => x?.name === r || x?.role === r));
};

const ProtectedRoute = ({ children, redirectTo = '/', roles, requireVerified = false }) => {
  const { isAuthenticated, user, initializing, mustVerify } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingSpinner fullScreen text="Verifying authentication..." />;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  if (mustVerify) return <Navigate to={`/welcome-verify?email=${encodeURIComponent(user?.email || '')}`} replace />;
  if (requireVerified && user && user.emailVerified === false) return <Navigate to="/verify-email" replace />;
  if (!hasRequiredRole(user, roles)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;


