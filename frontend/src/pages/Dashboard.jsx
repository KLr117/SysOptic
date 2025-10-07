import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStats } from "../services/api";
import { getOrdenes } from "../services/ordenTrabajoService";
import "../styles/dashboard.css";
import "../styles/pagination-tooltips.css";
import "../styles/tables.css";
import "../styles/theme.css";
import Titulo from "../components/Titulo";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [ultimasOrdenes, setUltimasOrdenes] = useState([]);
  const [loadingTablas, setLoadingTablas] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Función para cambiar ordenamiento
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Función para mostrar flecha de ordenamiento
  const renderSortArrow = (field) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';

  // Funciones de navegación
  const navegarAOrdenesTrabajo = () => navigate('/ordenes');
  const navegarANotificaciones = () => navigate('/notificaciones');
  const navegarAPanelAdmin = () => navigate('/admin');

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  // Función para cargar datos de las tablas
  const cargarDatosTablas = async () => {
    try {
      setLoadingTablas(true);
      
      // Cargar últimas órdenes (últimas 5)
      const ordenesResponse = await getOrdenes();
      console.log('Órdenes response:', ordenesResponse);
      if (ordenesResponse.ok) {
        const ordenesOrdenadas = ordenesResponse.orders
          .sort((a, b) => new Date(b.fecha_recepcion || b.created_at) - new Date(a.fecha_recepcion || a.created_at))
          .slice(0, 5);
        console.log('Órdenes ordenadas:', ordenesOrdenadas);
        setUltimasOrdenes(ordenesOrdenadas);
      } else {
        console.log('No se encontraron órdenes o formato incorrecto');
      }

      
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error cargando datos de tablas:', error);
    } finally {
      setLoadingTablas(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosTablas();
  }, []);

  // Actualización automática cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Actualizando datos del Dashboard...');
      cargarDatosTablas();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    
    <div className="dashboard-container">
      <div className="dashboard-background">
        <div className="bg-pattern pattern-1"></div>
        <div className="bg-pattern pattern-2"></div>
        <div className="bg-pattern pattern-3"></div>
      </div>
      <div className="dashboard-header">
        <Titulo text="Panel de Control" className="titulo" />
        <div className="dashboard-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
          <div className="decoration-glasses glasses-1">👓</div>
          <div className="decoration-glasses glasses-2">🥽</div>
          <div className="decoration-glasses glasses-3">🔍</div>
        </div>
        <div className="welcome-message">
          <span className="welcome-emoji">👋</span>
          <span className="welcome-text">¡Bienvenido a la Fundación Visual Óptica!</span>
        </div>
      </div>

      {err && <p className="error-state">Error: {err}</p>}

      {!stats ? (
        <p className="loading-state">Cargando...</p>
      ) : (
        <>
        <div className="dashboard-grid">
          <div className="grid-decoration">
            <div className="grid-line line-1"></div>
            <div className="grid-line line-2"></div>
            <div className="grid-line line-3"></div>
            <div className="grid-optical optical-1">🔬</div>
            <div className="grid-optical optical-2">💎</div>
            <div className="grid-optical optical-3">🔍</div>
            <div className="grid-optical optical-4">👁️</div>
          </div>
          <Card title="Expedientes" value={stats.expedientes} type="expedientes" />
          <Card title="Órdenes de Trabajo" value={stats.ordenes} type="ordenes" onClick={navegarAOrdenesTrabajo} />
          <Card title="Notificaciones" value={stats.notificaciones} type="notificaciones" onClick={navegarANotificaciones} />
          <Card title="Panel Administrativo" value="" type="admin" onClick={navegarAPanelAdmin} />
        </div>
          
          <div className="dashboard-date">
            <p className="current-date">
              📅 {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="last-update">
              🔄 Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
            </p>
          </div>

          {/* Tablas de Resumen */}
          <div className="dashboard-tables">
            <div className="tables-decoration">
              <div className="table-decoration-line line-1"></div>
              <div className="table-decoration-line line-2"></div>
            </div>
            <div className="dashboard-table-section">
              <div className="table-header-decoration">
                <div className="table-icon-bg">📋</div>
              </div>
              <h3 className="table-section-title">📋 Últimas Órdenes de Trabajo</h3>
              <TablaOrdenes 
                ordenes={ultimasOrdenes} 
                loading={loadingTablas}
              />
            </div>

          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, value, type, onClick }) {
  const icons = {
    expedientes: "📁",
    ordenes: "📋", 
    pendientes: "⏳",
    notificaciones: "🔔",
    admin: "⚙️"
  };

  return (
    <div className={`dashboard-card card-${type} ${onClick ? 'clickable-card' : ''}`} onClick={onClick}>
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

// Componente para tabla de órdenes
function TablaOrdenes({ ordenes, loading }) {
  if (loading) {
    return <div className="dashboard-loading">Cargando órdenes...</div>;
  }

  if (ordenes.length === 0) {
    return <div className="dashboard-empty">No hay órdenes recientes</div>;
  }

  return (
    <div className="table-container dashboard-scroll-container">
      <table className="table">
        <thead>
          <tr>
            <th>No Orden</th>
            <th>Paciente</th>
            <th>Dirección</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Fecha Recepción</th>
            <th>Fecha Entrega</th>
            <th>Total</th>
            <th>Adelanto</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.pk_id_orden}>
              <td>#{orden.pk_id_orden}</td>
              <td>{orden.paciente || 'N/A'}</td>
              <td>{orden.direccion || 'N/A'}</td>
              <td>{orden.correo || 'N/A'}</td>
              <td>{orden.telefono || 'N/A'}</td>
              <td>
                {orden.fecha_recepcion 
                  ? new Date(orden.fecha_recepcion).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </td>
              <td>
                {orden.fecha_entrega 
                  ? new Date(orden.fecha_entrega).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </td>
              <td>
                Q{parseFloat(orden.total || 0).toFixed(2)}
              </td>
              <td>
                Q{parseFloat(orden.adelanto || 0).toFixed(2)}
              </td>
              <td>
                Q{parseFloat(orden.saldo || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

