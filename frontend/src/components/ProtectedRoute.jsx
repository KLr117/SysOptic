import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/Auth";

export default function ProtectedRoute() {
  const user = getUser();
  
  // Si no hay usuario, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderiza el layout y las rutas hijas
  return <Outlet />;
}
