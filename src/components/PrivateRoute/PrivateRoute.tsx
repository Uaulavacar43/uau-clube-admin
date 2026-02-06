import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type AllowedRole = "ADMIN" | "MANAGER" | "USER";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role as AllowedRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
