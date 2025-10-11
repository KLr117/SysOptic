import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css'; // estilos de light/dark

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/OrdenTrabajo';
import EditarOrdenTrabajo from './pages/EditarOrdenTrabajo';
import AgregarOrdenTrabajo from './pages/AgregarOrdenTrabajo';
import VerOrdenTrabajo from './pages/VerOrdenTrabajo';
import Expedientes from './pages/Expedientes';
import AdminPanel from './pages/AdminPanel';
import Bitacora from './pages/bitacora';
import Notificaciones from './pages/Notificaciones';
import NotificacionForm from './pages/NotificacionForm';
import Unauthorized from './pages/Unauthorized';

// Layout y rutas protegidas
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Login público */}
          <Route path="/login" element={<Login />} />

          {/* Página de acceso denegado */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas protegidas con permisos */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Rutas de Administrador */}
              <Route element={<ProtectedRoute permisosRequeridos={['control_admin']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/bitacora" element={<Bitacora />} />
              </Route>

              {/* Rutas de Órdenes de Trabajo */}
              <Route element={<ProtectedRoute permisosRequeridos={['control_ordenes']} />}>
                <Route path="/ordenes" element={<Ordenes />} />
                <Route path="/editar-orden-trabajo/:id" element={<EditarOrdenTrabajo />} />
                <Route path="/agregar-orden-trabajo" element={<AgregarOrdenTrabajo />} />
                <Route path="/ver-orden-trabajo/:id" element={<VerOrdenTrabajo />} />
              </Route>

              {/* Rutas de Expedientes */}
              <Route element={<ProtectedRoute permisosRequeridos={['control_expedientes']} />}>
                <Route path="/expedientes" element={<Expedientes />} />
              </Route>

              {/* Rutas de Notificaciones */}
              <Route element={<ProtectedRoute permisosRequeridos={['control_notificaciones']} />}>
                <Route path="/notificaciones" element={<Notificaciones />} />
                <Route path="/notificaciones/nueva" element={<NotificacionForm mode="create" />} />
                <Route
                  path="/notificaciones/editar/:id"
                  element={<NotificacionForm mode="edit" />}
                />
              </Route>
            </Route>
          </Route>

          {/* Cualquier otra URL redirige a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
