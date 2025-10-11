import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getUser } from '../utils/Auth';

export default function ProtectedRoute({ permisosRequeridos = [] }) {
  const token = localStorage.getItem('token');
  const user = getUser();

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

    // Si se requieren permisos específicos, validar
    if (permisosRequeridos.length > 0) {
      const userPerms = user?.permisos || [];
      const hasAccess = permisosRequeridos.some((p) => userPerms.includes(p));

      if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Token válido y permisos correctos, renderiza las rutas hijas
    return <Outlet />;
  } catch (error) {
    // Token inválido o corrupto
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
