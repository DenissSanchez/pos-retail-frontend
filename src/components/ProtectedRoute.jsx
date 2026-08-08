import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ allowedRoles }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const userRole = (user.role || "").toUpperCase();

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol tiene permiso, muestra la pantalla; si no, lo manda a /sales
  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/sales" replace />;
};