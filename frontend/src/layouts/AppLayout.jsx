import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../utils/Auth';
import { useTheme } from '../context/ThemeContext';
import '../styles/applayout.css';
import '../styles/theme.css';
import '../styles/theme-switch.css';

export default function AppLayout() {
  const user = getUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-logo">
          <img src="/src/assets/logo.jpg" alt="Fundación Visual Óptica" className="logo-image" />
        </div>
        <nav className="app-nav">
          {user?.permisos?.includes('control_admin') && <Item to="/dashboard" label="Dashboard" />}
          {user?.permisos?.includes('control_admin') && (
            <Item to="/admin" label="Panel de Administracion" />
          )}
          {user?.permisos?.includes('control_ordenes') && (
            <Item to="/ordenes" label="Orden de Trabajo" />
          )}
          {user?.permisos?.includes('control_expedientes') && (
            <Item to="/expedientes" label="Expedientes de Pacientes" />
          )}
          {user?.permisos?.includes('control_notificaciones') && (
            <Item to="/notificaciones" label="Notificaciones" />
          )}
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div className="user-info">
            <div className="user-avatar">
              {user ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'}
            </div>
            <span>{user ? `Hola, ${user.firstName} ${user.lastName}` : 'Panel'}</span>
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              marginLeft: 'auto',
              marginRight: '1rem',
              display: 'flex',
              gap: '10px',
            }}
          >
            <span>📅 {currentTime.toLocaleDateString()}</span>
            <span>⏰ {currentTime.toLocaleTimeString()}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </header>

        <div className="app-content">
          <Outlet />
        </div>
      </main>

      {/* Botón flotante de tema con etiqueta */}
      <div className="theme-switch-wrapper">
        <button onClick={toggleTheme} className="theme-switch">
          {isDarkMode ? '☀️' : '🌙'}
          <span className="theme-label">{isDarkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
      </div>
    </div>
  );
}

function Item({ to, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      {label}
    </NavLink>
  );
}
