import React from "react";
import { useEffect, useState } from "react";
import { getStats } from "../services/api";
import "../styles/dashboard.css";
import Titulo from "../components/Titulo";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    
    <div className="dashboard-container">
      <Titulo text="Panel de Control" className="titulo" />
      
      <p className="dashboard-subtitle">Sistema de Gestión Óptica - Resumen General</p>

      {err && <p className="error-state">Error: {err}</p>}

      {!stats ? (
        <p className="loading-state">Cargando...</p>
      ) : (
        <div className="dashboard-grid">
          <Card title="Expedientes" value={stats.expedientes} type="expedientes" />
          <Card title="Órdenes" value={stats.ordenes} type="ordenes" />
          <Card title="Pend. de entrega" value={stats.pendientesEntrega} type="pendientes" />
          <Card title="Notificaciones" value={stats.notificaciones} type="notificaciones" />
        </div>
      )}
    </div>
  );
}

function Card({ title, value, type }) {
  const icons = {
    expedientes: "📁",
    ordenes: "📋", 
    pendientes: "⏳",
    notificaciones: "🔔"
  };

  return (
    <div className={`dashboard-card card-${type}`}>
      <div className="card-content">
        <div className="card-info">
          <p className="card-title">{title}</p>
          <p className="card-value">{value}</p>
        </div>
        <div className="card-icon">
          {icons[type]}
        </div>
      </div>
    </div>
  );
}
