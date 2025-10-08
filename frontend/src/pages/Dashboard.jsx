import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStats } from "../services/api";
import { getOrdenes } from "../services/ordenTrabajoService";
import { getExpedientes } from "../services/expedientesService";
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
  const [ultimosExpedientes, setUltimosExpedientes] = useState([]);
  const [loadingTablas, setLoadingTablas] = useState(true);
  
  // Estados de ordenamiento para órdenes
  const [sortFieldOrdenes, setSortFieldOrdenes] = useState("fecha_recepcion");
  const [sortDirectionOrdenes, setSortDirectionOrdenes] = useState("desc");
  
  // Estados de ordenamiento para expedientes
  const [sortFieldExpedientes, setSortFieldExpedientes] = useState("fecha_registro");
  const [sortDirectionExpedientes, setSortDirectionExpedientes] = useState("desc");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Funciones de ordenamiento para órdenes
  const toggleSortOrdenes = (field) => {
    if (sortFieldOrdenes === field) {
      setSortDirectionOrdenes((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortFieldOrdenes(field);
      setSortDirectionOrdenes('desc');
    }
  };

  const renderSortArrowOrdenes = (field) =>
    sortFieldOrdenes === field ? (sortDirectionOrdenes === 'asc' ? '↑' : '↓') : '↕';

  // Funciones de ordenamiento para expedientes
  const toggleSortExpedientes = (field) => {
    if (sortFieldExpedientes === field) {
      setSortDirectionExpedientes((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortFieldExpedientes(field);
      setSortDirectionExpedientes('desc');
    }
  };

  const renderSortArrowExpedientes = (field) =>
    sortFieldExpedientes === field ? (sortDirectionExpedientes === 'asc' ? '↑' : '↓') : '↕';

  // Funciones de navegación
  const navegarAOrdenesTrabajo = () => navigate('/ordenes');
  const navegarANotificaciones = () => navigate('/notificaciones');
  const navegarAPanelAdmin = () => navigate('/admin');
  const navegarAExpedientes = () => navigate('/expedientes');

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  // Función para cargar datos de las tablas
  const cargarDatosTablas = async () => {
    try {
      setLoadingTablas(true);
      
      // Cargar últimas órdenes (últimas 5 por número de orden)
      const ordenesResponse = await getOrdenes();
      console.log('Órdenes response:', ordenesResponse);
      if (ordenesResponse.ok) {
        const ordenesOrdenadas = ordenesResponse.orders
          .sort((a, b) => {
            const numA = parseInt(a.pk_id_orden) || 0;
            const numB = parseInt(b.pk_id_orden) || 0;
            return numB - numA; // Números más altos primero (más recientes)
          })
          .slice(0, 5);
        console.log('Órdenes ordenadas por número:', ordenesOrdenadas);
        setUltimasOrdenes(ordenesOrdenadas);
      } else {
        console.log('No se encontraron órdenes o formato incorrecto');
      }

      // Cargar últimos expedientes (últimos 5 por correlativo)
      try {
        const expedientesResponse = await getExpedientes();
        console.log('Expedientes response:', expedientesResponse);
        if (Array.isArray(expedientesResponse)) {
          const expedientesOrdenados = expedientesResponse
            .sort((a, b) => {
              // Ordenar por correlativo (numérico si es posible, sino alfabético)
              const correlativoA = a.correlativo || '';
              const correlativoB = b.correlativo || '';
              
              // Intentar convertir a número si es posible
              const numA = parseInt(correlativoA);
              const numB = parseInt(correlativoB);
              
              if (!isNaN(numA) && !isNaN(numB)) {
                return numB - numA; // Números más altos primero
              } else {
                return correlativoB.localeCompare(correlativoA); // Alfabético descendente
              }
            })
            .slice(0, 5);
          console.log('Expedientes ordenados por correlativo:', expedientesOrdenados);
          setUltimosExpedientes(expedientesOrdenados);
        } else {
          console.log('No se encontraron expedientes o formato incorrecto');
        }
      } catch (expedientesError) {
        console.error('Error cargando expedientes:', expedientesError);
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

  // Actualización automática cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Actualizando datos del Dashboard...');
      cargarDatosTablas();
    }, 600000); // 10 minutos

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
          <Card title="Expedientes" value={stats.expedientes} type="expedientes" onClick={navegarAExpedientes} />
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
                sortField={sortFieldOrdenes}
                sortDirection={sortDirectionOrdenes}
                onSort={toggleSortOrdenes}
                renderSortArrow={renderSortArrowOrdenes}
              />
            </div>

            <div className="dashboard-table-section">
              <div className="table-header-decoration">
                <div className="table-icon-bg">📁</div>
              </div>
              <h3 className="table-section-title">📁 Últimos Expedientes</h3>
              <TablaExpedientes 
                expedientes={ultimosExpedientes} 
                loading={loadingTablas}
                sortField={sortFieldExpedientes}
                sortDirection={sortDirectionExpedientes}
                onSort={toggleSortExpedientes}
                renderSortArrow={renderSortArrowExpedientes}
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
        </div>
        <div className="card-icon">
          {icons[type]}
        </div>
      </div>
    </div>
  );
}

// Componente para tabla de órdenes
function TablaOrdenes({ ordenes, loading, sortField, sortDirection, onSort, renderSortArrow }) {
  if (loading) {
    return <div className="dashboard-loading">Cargando órdenes...</div>;
  }

  if (ordenes.length === 0) {
    return <div className="dashboard-empty">No hay órdenes recientes</div>;
  }

  // Función para ordenar los datos
  const ordenesOrdenadas = [...ordenes].sort((a, b) => {
    let valorA, valorB;
    
    switch (sortField) {
      case 'pk_id_orden':
        valorA = parseInt(a.pk_id_orden) || 0;
        valorB = parseInt(b.pk_id_orden) || 0;
        break;
      case 'paciente':
        valorA = (a.paciente || '').toLowerCase();
        valorB = (b.paciente || '').toLowerCase();
        break;
      case 'fecha_recepcion':
        valorA = new Date(a.fecha_recepcion || a.created_at || 0);
        valorB = new Date(b.fecha_recepcion || b.created_at || 0);
        break;
      case 'fecha_entrega':
        valorA = new Date(a.fecha_entrega || 0);
        valorB = new Date(b.fecha_entrega || 0);
        break;
      case 'total':
        valorA = parseFloat(a.total || 0);
        valorB = parseFloat(b.total || 0);
        break;
      case 'adelanto':
        valorA = parseFloat(a.adelanto || 0);
        valorB = parseFloat(b.adelanto || 0);
        break;
      case 'saldo':
        valorA = parseFloat(a.saldo || 0);
        valorB = parseFloat(b.saldo || 0);
        break;
      default:
        valorA = a[sortField] || '';
        valorB = b[sortField] || '';
    }
    
    if (typeof valorA === 'string' && typeof valorB === 'string') {
      return sortDirection === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    
    return sortDirection === 'asc' ? valorA - valorB : valorB - valorA;
  });

  return (
    <div className="table-container dashboard-scroll-container">
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => onSort('pk_id_orden')} className="sortable-header">
              <div className="header-text">
                <div>No.</div>
                <div>orden {renderSortArrow('pk_id_orden')}</div>
              </div>
            </th>
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
          {ordenesOrdenadas.map((orden) => (
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

// Componente para tabla de expedientes
function TablaExpedientes({ expedientes, loading, sortField, sortDirection, onSort, renderSortArrow }) {
  if (loading) {
    return <div className="dashboard-loading">Cargando expedientes...</div>;
  }

  if (expedientes.length === 0) {
    return <div className="dashboard-empty">No hay expedientes recientes</div>;
  }

  // Función para ordenar los datos
  const expedientesOrdenados = [...expedientes].sort((a, b) => {
    let valorA, valorB;
    
    switch (sortField) {
      case 'correlativo':
        valorA = (a.correlativo || '').toLowerCase();
        valorB = (b.correlativo || '').toLowerCase();
        break;
      case 'nombre':
        valorA = (a.nombre || '').toLowerCase();
        valorB = (b.nombre || '').toLowerCase();
        break;
      case 'telefono':
        valorA = (a.telefono || '').toLowerCase();
        valorB = (b.telefono || '').toLowerCase();
        break;
      case 'direccion':
        valorA = (a.direccion || '').toLowerCase();
        valorB = (b.direccion || '').toLowerCase();
        break;
      case 'email':
        valorA = (a.email || '').toLowerCase();
        valorB = (b.email || '').toLowerCase();
        break;
      case 'fecha_registro':
        valorA = new Date(a.fecha_registro || a.created_at || a.fecha_creacion || 0);
        valorB = new Date(b.fecha_registro || b.created_at || b.fecha_creacion || 0);
        break;
      default:
        valorA = a[sortField] || '';
        valorB = b[sortField] || '';
    }
    
    if (typeof valorA === 'string' && typeof valorB === 'string') {
      return sortDirection === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    
    return sortDirection === 'asc' ? valorA - valorB : valorB - valorA;
  });

  return (
    <div className="table-container dashboard-scroll-container">
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => onSort('correlativo')} className="sortable-header">
              <div className="header-text">
                <div>No.</div>
                <div>Correlativo {renderSortArrow('correlativo')}</div>
              </div>
            </th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Email</th>
            <th>Fecha Registro</th>
          </tr>
        </thead>
        <tbody>
          {expedientesOrdenados.map((expediente) => (
            <tr key={expediente.id || expediente.pk_id_expediente}>
              <td>{expediente.correlativo || 'N/A'}</td>
              <td>{expediente.nombre || 'N/A'}</td>
              <td>{expediente.telefono || 'N/A'}</td>
              <td>{expediente.direccion || 'N/A'}</td>
              <td>{expediente.email || 'N/A'}</td>
              <td>
                {expediente.fecha_registro 
                  ? new Date(expediente.fecha_registro).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

