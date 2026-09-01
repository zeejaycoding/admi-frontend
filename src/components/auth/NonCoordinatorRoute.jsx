import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';

const isCoordinator = (user) => {
  if (!user) return false;
  const userRoles = user?.roles || user?.authorities || [];
  const list = Array.isArray(userRoles) ? userRoles : [userRoles];
  return list.some(
    (r) => r === 'COORDINATOR' || r?.name === 'COORDINATOR' || r?.role === 'COORDINATOR',
  );
};

const NonCoordinatorRoute = ({ children, redirectTo = '/admin/reports' }) => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) return <LoadingSpinner fullScreen text="Verifying authentication..." />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (isCoordinator(user)) return <Navigate to={redirectTo} replace />;
  return children;
};

export default NonCoordinatorRoute;
