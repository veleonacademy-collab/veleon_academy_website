import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

// Redirects to a dedicated dashboard based on the authenticated user's role.
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  console.log(user);

  if (!user) return null;

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "tutor") {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  if (user.role === "user") {
    return <Navigate to="/user/dashboard" replace />;
  }

  // Default: student role
  return <Navigate to="/student/dashboard" replace />;
};

export default DashboardPage;
