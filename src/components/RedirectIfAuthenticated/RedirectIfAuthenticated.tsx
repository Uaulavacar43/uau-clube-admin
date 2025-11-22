import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
  redirectTo: string;
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({
  children,
  redirectTo,
}) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
