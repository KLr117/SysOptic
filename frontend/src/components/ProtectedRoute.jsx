import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decodificar y validar el token
    const decoded = jwtDecode(token);

    // Verificar si el token está expirado
    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // Token válido, renderiza las rutas hijas
    return <Outlet />;
  } catch (error) {
    // Token inválido o corrupto
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
