import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  console.log(
    "ProtectedRoute: isLoading:",
    isLoading,
    "isAuthenticated:",
    isAuthenticated,
    "user:",
    user
  );

  if (isLoading) {
    console.log("ProtectedRoute: Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute: Access denied for role:", user.role);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  console.log("ProtectedRoute: Access granted, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
