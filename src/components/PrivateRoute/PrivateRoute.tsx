import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type AllowedRole = "ADMIN" | "MANAGER" | "USER";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
  redirectToWhenUnauthorized?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
                                                     children,
                                                     allowedRoles,
                                                     redirectToWhenUnauthorized = "/dashboard",
                                                   }) => {
  const { isAuthenticated, user } = useAuth() as {
    isAuthenticated: boolean;
    user?: { role?: string } | null;
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = String(user?.role ?? "");
    const isAllowed = allowedRoles.includes(role as AllowedRole);

    if (!isAllowed) {
      return <Navigate to={redirectToWhenUnauthorized} replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
