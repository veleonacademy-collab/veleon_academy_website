import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

// Redirects to a dedicated dashboard based on the authenticated user's role.
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "tutor") {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  if (user.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Non-student users who are partners → go to partner portal
  if (user.referralCode) {
    return <Navigate to="/partners/dashboard" replace />;
  }

  // All other cases (plain 'user' role, not yet a partner)
  return <Navigate to="/student/dashboard" replace />;
};

export default DashboardPage;
