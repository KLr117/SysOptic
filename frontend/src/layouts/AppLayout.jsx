import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { logout, getUser } from "../utils/Auth";
import { useTheme } from "../context/ThemeContext"; 
import "../styles/applayout.css";
import "../styles/theme.css"; // estilos de dark/light
import "../styles/theme-switch.css"; // estilos del botón flotante

export default function AppLayout() {
  const user = getUser();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-logo">
          <h1>SysOptic</h1>
        </div>
        <nav className="app-nav">
          <Item to="/dashboard" label="Dashboard" />
          <Item to="/admin" label="Panel de Administracion" />
          <Item to="/ordenes" label="Orden de Trabajo" />  
          <Item to="/expedientes" label="Expedientes de Pacientes" />
          <Item to="/notificaciones" label="Notificaciones" />
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div className="user-info">
            <div className="user-avatar">
              {user ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <span>
              {user ? `Hola, ${user.username}` : "Panel"}
            </span>
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
          {isDarkMode ? "☀️" : "🌙"}
          <span className="theme-label">
            {isDarkMode ? "Modo claro" : "Modo oscuro"}
          </span>
        </button>
      </div>
    </div>  
  );
}

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }
    >
      {label}
    </NavLink>
  );
}
