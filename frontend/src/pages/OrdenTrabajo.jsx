import React, { useState, useEffect } from 'react';
import '../styles/orden-trabajo.css';
import '../styles/table-responsive.css';
import '../styles/tables.css';
import '../styles/popup.css';
import '../styles/pagination-tooltips.css';
import '../styles/vista-notificaciones.css';
import Titulo from '../components/Titulo';
import Button from '../components/Button';
import PopUp from '../components/PopUp';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrdenes, deleteOrden } from '../services/ordenTrabajoService';
import { obtenerTodasLasImagenes } from '../services/imagenesOrdenesService';
import {
  getEstadoNotificacionOrden,
  getNotificacionEspecificaById,
  deleteNotificacionEspecifica,
} from '../services/notificacionesService';
import ImageModal from '../components/ImageModal';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

const OrdenTrabajo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const columns = [
    '#',
    'No Orden',
    'Paciente',
    'Dirección',
    'Correo',
    'Teléfono',
    'Fecha Recepción',
    'Fecha Entrega',
    'Total',
    'Adelanto',
    'Saldo',
    'Observaciones',
    'Imágenes',
    'Acciones',
    'Notificación',
    'Estado de notificación',
  ];

  const [ordenesData, setOrdenesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificacionesEstado, setNotificacionesEstado] = useState({});

  // Estado para fila seleccionada
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);

  // Función para manejar la selección de filas
  const handleSeleccionarFila = (orden) => {
    if (filaSeleccionada === orden.pk_id_orden) {
      // Si ya está seleccionada, deseleccionar
      setFilaSeleccionada(null);
    } else {
      // Seleccionar nueva fila
      setFilaSeleccionada(orden.pk_id_orden);
    }
  };

  // Estados para modal de visualización
  const [modalVisible, setModalVisible] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Función para cambiar ordenamiento
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para mostrar flecha de ordenamiento
  const renderSortArrow = (field) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';

  // Función para manejar el cambio del select de ordenamiento
  const handleSortChange = (option) => {
    setSortOption(option);
    switch (option) {
      case 'id':
        setSortField('id');
        setSortDirection('asc');
        break;
      case 'idDesc':
        setSortField('id');
        setSortDirection('desc');
        break;
      case 'paciente':
        setSortField('paciente');
        setSortDirection('asc');
        break;
      case 'pacienteDesc':
        setSortField('paciente');
        setSortDirection('desc');
        break;
      case 'fechaRecepcion':
        setSortField('fechaRecepcion');
        setSortDirection('asc');
        break;
      case 'fechaRecepcionDesc':
        setSortField('fechaRecepcion');
        setSortDirection('desc');
        break;
      case 'fechaEntrega':
        setSortField('fechaEntrega');
        setSortDirection('asc');
        break;
      case 'fechaEntregaDesc':
        setSortField('fechaEntrega');
        setSortDirection('desc');
        break;
      case '':
        // No hacer nada si no se ha seleccionado
        break;
      default:
        setSortField('id');
        setSortDirection('asc');
    }
  };

  // Estados para PopUp
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Estado para orden a eliminar
  const [ordenAEliminar, setOrdenAEliminar] = useState(null);

  // Estado para modal de confirmación de eliminación de notificación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  // Estado para imágenes de órdenes desde la base de datos
  const [imagenesOrdenes, setImagenesOrdenes] = useState({});

  // Estado para modal de imagen
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para modal de observaciones
  const [modalObservaciones, setModalObservaciones] = useState(null);
  const [isModalObservacionesOpen, setIsModalObservacionesOpen] = useState(false);

  // Función para simular guardado de imágenes
  const guardarImagenesOrden = (ordenId, imagenes) => {
    if (imagenes && imagenes.length > 0) {
      setImagenesOrdenes((prev) => ({
        ...prev,
        [ordenId]: imagenes,
      }));
    }
  };

  // Cargar imágenes desde la base de datos
  useEffect(() => {
    const cargarImagenes = async () => {
      try {
        const response = await obtenerTodasLasImagenes();
        if (response.success) {
          // Agrupar imágenes por orden_id
          const imagenesAgrupadas = {};
          response.imagenes.forEach((imagen) => {
            if (!imagenesAgrupadas[imagen.orden_id]) {
              imagenesAgrupadas[imagen.orden_id] = [];
            }
            imagenesAgrupadas[imagen.orden_id].push({
              id: imagen.id,
              nombre: imagen.nombre_archivo,
              preview: imagen.ruta_archivo, // URL del servidor
              url: imagen.ruta_archivo, // URL completa para el modal
            });
          });
          setImagenesOrdenes(imagenesAgrupadas);
          console.log('Imágenes cargadas desde BD:', imagenesAgrupadas);
        }
      } catch (error) {
        console.error('Error cargando imágenes:', error);
      }
    };

    cargarImagenes();
  }, []);

  // Cargar órdenes desde el backend
  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrdenes();
        if (response.ok) {
          setOrdenesData(response.orders);
        } else {
          setError('Error al cargar las órdenes');
        }
      } catch (err) {
        console.error('Error cargando órdenes:', err);
        setError('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, []);

  // 🔹 Cargar estados de notificaciones
  useEffect(() => {
    const cargarEstadosNotificaciones = async () => {
      if (ordenesData.length === 0) return;

      const estados = {};
      for (const orden of ordenesData) {
        try {
          const response = await getEstadoNotificacionOrden(orden.pk_id_orden);
          if (response.ok) {
            estados[orden.pk_id_orden] = response;
          }
        } catch (error) {
          console.error(
            `Error al cargar estado de notificación para orden ${orden.pk_id_orden}:`,
            error
          );
        }
      }
      setNotificacionesEstado(estados);
    };

    cargarEstadosNotificaciones();
  }, [ordenesData]);

  // 🔄 Refresco automático al volver desde formulario
  useEffect(() => {
    if (ordenesData.length > 0) {
      refreshNotificaciones();
    }
  }, [location]);

  const agregarOrden = () => navigate('/agregar-orden-trabajo');
  const editarOrden = (id) => navigate(`/editar-orden-trabajo/${id}`);

  const verOrden = (id) => navigate(`/ver-orden-trabajo/${id}`);

  // Funciones para modal de imagen
  const openImageModal = (imagen, ordenId) => {
    setModalImage(imagen);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setModalImage(null);
    setIsModalOpen(false);
  };

  // Funciones para modal de observaciones
  const openObservacionesModal = (observaciones, orden) => {
    setModalObservaciones({
      texto: observaciones,
      ordenId: orden.pk_id_orden,
      correlativo: orden.correlativo,
    });
    setIsModalObservacionesOpen(true);
  };

  const closeObservacionesModal = () => {
    setModalObservaciones(null);
    setIsModalObservacionesOpen(false);
  };

  const confirmarEliminacion = (id) => {
    setOrdenAEliminar(id);
    setPopup({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la orden ${id}?`,
      type: 'warning',
      showButtons: true,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => eliminarOrden(id),
      onCancel: () => {
        setOrdenAEliminar(null);
        setPopup((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const eliminarOrden = async (id) => {
    try {
      const response = await deleteOrden(id);
      if (response.ok) {
        setOrdenesData((prev) => prev.filter((o) => o.pk_id_orden !== id));
        setPopup({
          isOpen: true,
          title: 'Orden Eliminada',
          message: `La orden ${id} ha sido eliminada exitosamente.`,
          type: 'success',
          showButtons: true,
          confirmText: 'Aceptar',
          onConfirm: () => {
            setOrdenAEliminar(null);
            setPopup((prev) => ({ ...prev, isOpen: false }));
          },
        });
      } else {
        setPopup({
          isOpen: true,
          title: 'Error',
          message: 'Error al eliminar la orden. Intente nuevamente.',
          type: 'error',
          showButtons: true,
          confirmText: 'Aceptar',
          onConfirm: () => {
            setOrdenAEliminar(null);
            setPopup((prev) => ({ ...prev, isOpen: false }));
          },
        });
      }
    } catch (err) {
      console.error('Error eliminando orden:', err);
      setPopup({
        isOpen: true,
        title: 'Error',
        message: 'Error al eliminar la orden. Intente nuevamente.',
        type: 'error',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => {
          setOrdenAEliminar(null);
          setPopup((prev) => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const handleEstadoChange = (id, value) => {
    // TODO: Implementar actualización de estado en el backend
    console.log('Cambiar estado de orden', id, 'a', value);
  };

  // 🔔 Handlers de notificaciones
  const refreshNotificaciones = async () => {
    try {
      const estados = {};
      for (const orden of ordenesData) {
        const res = await getEstadoNotificacionOrden(orden.pk_id_orden);
        if (res.ok) {
          estados[orden.pk_id_orden] = {
            tieneNotificacion: res.tieneNotificacion,
            estado: res.estado,
            id: res.id,
            titulo: res.titulo,
          };
        }
      }
      setNotificacionesEstado(estados);
    } catch (error) {
      console.error('Error al cargar estados de notificaciones:', error);
    }
  };

  const handleViewNotificacion = async (orden) => {
    const estado = notificacionesEstado[orden.pk_id_orden];
    if (!estado?.id) {
      showPopup('Info', 'No hay una notificación asociada a este registro.', 'info');
      return;
    }
    try {
      const res = await getNotificacionEspecificaById(estado.id);
      if (res && res.pk_id_notificacion) {
        setNotificacionSeleccionada(res);
        setModalVisible(true);
      } else {
        showPopup('Error', 'No se pudo cargar la notificación.', 'error');
      }
    } catch (error) {
      console.error('Error al obtener detalles de la notificación:', error);
      if (error.response?.status === 401) {
        showPopup('Error', 'No tienes permisos para ver esta notificación.', 'error');
      } else {
        showPopup('Error', 'Error al cargar la notificación. Intenta nuevamente.', 'error');
      }
    }
  };

  const handleDeleteNotificacion = (idNotificacion, idOrden) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Seguro que deseas eliminar esta notificación?',
      onConfirm: () => confirmDeleteNotificacion(idNotificacion, idOrden),
      onCancel: () =>
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null }),
    });
  };

  const confirmDeleteNotificacion = async (idNotificacion, idOrden) => {
    try {
      const res = await deleteNotificacionEspecifica(idNotificacion);
      if (res.ok || res.success) {
        await refreshNotificaciones();
        showPopup('Éxito', 'Notificación eliminada correctamente.', 'success');
      } else {
        showPopup('Error', 'No se pudo eliminar la notificación.', 'error');
      }
    } catch (error) {
      console.error(error);
      showPopup('Error', 'Error al eliminar la notificación.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
    }
  };

  const handleNotificacionChange = (orden, action) => {
    const estado = notificacionesEstado[orden.pk_id_orden];

    if (action === 'Crear' && !estado?.tieneNotificacion) {
      navigate(`/notificaciones-especificas/orden/${orden.pk_id_orden}`, {
        state: {
          registro: {
            correlativo: orden.correlativo,
            paciente: orden.paciente,
          },
        },
      });
    } else if (action === 'Mostrar' && estado?.tieneNotificacion) {
      handleViewNotificacion(orden);
    } else if (action === 'Editar' && estado?.tieneNotificacion) {
      navigate(`/notificaciones-especificas/editar/${estado.id}`, { state: { from: 'ordenes' } });
    } else if (action === 'Eliminar' && estado?.tieneNotificacion) {
      handleDeleteNotificacion(estado.id, orden.pk_id_orden);
    }
  };

  // 🔍 Búsqueda y filtrado
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const result = ordenesData
      .filter((orden) => {
        if (!search.trim()) return true;
        const filtro = search.toLowerCase().trim();

        // Función para normalizar texto (quitar acentos y tildes)
        const normalizarTexto = (texto) => {
          return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
        };

        // Función para formatear fechas para búsqueda
        const formatearFecha = (fecha) => {
          if (!fecha) return '';
          const date = new Date(fecha);
          return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        };

        // Búsqueda en diferentes campos (normalizada)
        const busquedaPaciente = normalizarTexto(orden.paciente || '').includes(
          normalizarTexto(filtro)
        );
        const busquedaTelefono = (orden.telefono || '').toLowerCase().includes(filtro);
        const busquedaCorreo = normalizarTexto(orden.correo || '').includes(
          normalizarTexto(filtro)
        );
        const busquedaDireccion = normalizarTexto(orden.direccion || '').includes(
          normalizarTexto(filtro)
        );
        const busquedaId = (orden.pk_id_orden || '').toString().includes(filtro);
        const busquedaCorrelativo = (orden.correlativo || '').toString().includes(filtro);

        // Búsqueda en fechas (formato DD/MM/YYYY)
        const fechaRecepcionFormateada = formatearFecha(orden.fecha_recepcion);
        const fechaEntregaFormateada = formatearFecha(orden.fecha_entrega);
        const busquedaFechaRecepcion = fechaRecepcionFormateada.includes(filtro);
        const busquedaFechaEntrega = fechaEntregaFormateada.includes(filtro);

        // Búsqueda en totales (formato numérico)
        const busquedaTotal = (orden.total || '').toString().includes(filtro);
        const busquedaAdelanto = (orden.adelanto || '').toString().includes(filtro);
        const busquedaSaldo = (orden.saldo || '').toString().includes(filtro);

        // Búsqueda en observaciones
        const busquedaObservaciones = normalizarTexto(orden.observaciones || '').includes(
          normalizarTexto(filtro)
        );

        return (
          busquedaPaciente ||
          busquedaTelefono ||
          busquedaCorreo ||
          busquedaDireccion ||
          busquedaId ||
          busquedaCorrelativo ||
          busquedaFechaRecepcion ||
          busquedaFechaEntrega ||
          busquedaTotal ||
          busquedaAdelanto ||
          busquedaSaldo ||
          busquedaObservaciones
        );
      })
      .sort((a, b) => {
        // Ordenar según combobox
        const dir = sortDirection === 'asc' ? 1 : -1;

        if (sortField === 'id') return dir * ((a.pk_id_orden || 0) - (b.pk_id_orden || 0));
        if (sortField === 'paciente') {
          return dir * (a.paciente || '').localeCompare(b.paciente || '');
        }
        if (sortField === 'fechaRecepcion' || sortField === 'fechaEntrega') {
          const fieldName = sortField === 'fechaRecepcion' ? 'fecha_recepcion' : 'fecha_entrega';
          const da = a[fieldName] ? new Date(a[fieldName]) : new Date(0);
          const db = b[fieldName] ? new Date(b[fieldName]) : new Date(0);
          return dir * (da - db);
        }
        return 0;
      });
    setFiltered(result);
    setCurrentPage(1); // reset a primera página
  }, [search, ordenesData, sortField, sortDirection]);

  // 📑 Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const ordenesPaginadas = filtered.slice(startIndex, endIndex);

  // Mostrar loading
  if (loading) {
    return (
      <div className="ordenes-container">
        <div className="flex justify-between items-center mb-4">
          <Titulo text="Órdenes de Trabajo" className="titulo" />
          <button onClick={agregarOrden} className="btn-agregar-orden">
            ➕ Agregar Orden
          </button>
        </div>
        <div className="text-center py-8">
          <p>Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="ordenes-container">
        <div className="flex justify-between items-center mb-4">
          <Titulo text="Órdenes de Trabajo" className="titulo" />
          <button onClick={agregarOrden} className="btn-agregar-orden">
            ➕ Agregar Orden
          </button>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ordenes-container">
      {/* Iconos flotantes decorativos */}
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>
      <div className="decoration-circle circle-4"></div>
      <div className="decoration-circle circle-5"></div>

      <div className="decoration-glasses glasses-1">👓</div>
      <div className="decoration-glasses glasses-2">🥽</div>
      <div className="decoration-glasses glasses-3">👓</div>
      <div className="decoration-glasses glasses-4">🥽</div>
      <div className="decoration-glasses glasses-5">👓</div>

      <div className="decoration-tools tool-1">🔧</div>
      <div className="decoration-tools tool-2">⚙️</div>
      <div className="decoration-tools tool-3">🔨</div>
      <div className="decoration-tools tool-4">🛠️</div>

      <h2>Órdenes de Trabajo</h2>

      {/* FILA DE CONTROLES (ARRIBA) */}
      <div className="table-actions">
        <button onClick={agregarOrden} className="btn-agregar">
          ➕ Agregar Orden
        </button>

        <input
          type="text"
          placeholder="🔍 Buscar por paciente, teléfono, correo, fechas, totales, observaciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
          data-tooltip="Filtra por paciente, teléfono, correo, fechas, totales, observaciones"
        />

        <div className="sort-container">
          <label htmlFor="sortSelect" className="sort-label">
            Ordenar por:
          </label>
          <select
            id="sortSelect"
            className="sort-combobox"
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{ width: '200px', fontSize: '12px' }}
            data-tooltip="Selecciona una ordenación rápida"
          >
            <option value="" disabled>
              Seleccione
            </option>
            <option value="id"># Ascendente</option>
            <option value="idDesc"># Descendente</option>
            <option value="fechaRecepcion">Fecha Recepción (antigua)</option>
            <option value="fechaRecepcionDesc">Fecha Recepción (reciente)</option>
            <option value="fechaEntrega">Fecha Entrega (antigua)</option>
            <option value="fechaEntregaDesc">Fecha Entrega (reciente)</option>
            <option value="paciente">Paciente A-Z</option>
            <option value="pacienteDesc">Paciente Z-A</option>
          </select>
        </div>
      </div>

      {/* TABLA CON SCROLL HORIZONTAL */}
      <div
        className="overflow-x-auto overflow-y-hidden scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-600"
        id="table-container"
      >
        <table className="table orden-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('id')} className="sortable-header">
                <div className="header-text">
                  <div>#</div>
                  <div>{renderSortArrow('id')}</div>
                </div>
              </th>
              <th>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <div>No.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Orden</span>
                    <span style={{ fontSize: '12px' }}>↕</span>
                  </div>
                </div>
              </th>
              <th onClick={() => toggleSort('paciente')}>Paciente {renderSortArrow('paciente')}</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th onClick={() => toggleSort('fechaRecepcion')} className="sortable-header">
                <div className="header-text">
                  <div>Fecha</div>
                  <div>Recepción {renderSortArrow('fechaRecepcion')}</div>
                </div>
              </th>
              <th onClick={() => toggleSort('fechaEntrega')} className="sortable-header">
                <div className="header-text">
                  <div>Fecha</div>
                  <div>Entrega {renderSortArrow('fechaEntrega')}</div>
                </div>
              </th>
              <th>Total</th>
              <th>Adelanto</th>
              <th>Saldo</th>
              <th>Observaciones</th>
              <th>Imágenes</th>
              <th>Acciones</th>
              <th>Notificación</th>
              <th>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    lineHeight: '1.2',
                  }}
                >
                  <div>Estado</div>
                  <div>de</div>
                  <div>Notificación</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {ordenesPaginadas.length > 0 ? (
              ordenesPaginadas.map((orden) => (
                <tr
                  key={orden.pk_id_orden}
                  className={filaSeleccionada === orden.pk_id_orden ? 'fila-seleccionada' : ''}
                  onClick={() => handleSeleccionarFila(orden)}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <td>{orden.pk_id_orden}</td>
                  <td>{orden.correlativo}</td>
                  <td>{orden.paciente}</td>
                  <td>{orden.direccion}</td>
                  <td>{orden.correo}</td>
                  <td>{orden.telefono}</td>
                  <td>
                    {orden.fecha_recepcion
                      ? new Date(orden.fecha_recepcion).toLocaleDateString('es-ES')
                      : ''}
                  </td>
                  <td>
                    {orden.fecha_entrega
                      ? new Date(orden.fecha_entrega).toLocaleDateString('es-ES')
                      : ''}
                  </td>
                  <td className="text-right">Q{parseFloat(orden.total || 0).toFixed(2)}</td>
                  <td className="text-right">Q{parseFloat(orden.adelanto || 0).toFixed(2)}</td>
                  <td className="text-right font-semibold saldo-cell">
                    Q{parseFloat(orden.saldo || 0).toFixed(2)}
                  </td>
                  <td
                    className="observaciones-cell"
                    style={{
                      maxWidth: '200px',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontSize: '12px',
                      lineHeight: '1.3',
                    }}
                  >
                    {orden.observaciones ? (
                      <div
                        style={{
                          backgroundColor: 'var(--color-bg-secondary)',
                          color: 'var(--color-text)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)',
                          maxHeight: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onClick={() => openObservacionesModal(orden.observaciones, orden)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--color-bg)';
                          e.target.style.borderColor = 'var(--color-primary)';
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--color-bg-secondary)';
                          e.target.style.borderColor = 'var(--color-border)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Hacer clic para ver observaciones completas"
                      >
                        {orden.observaciones.length > 100
                          ? `${orden.observaciones.substring(0, 100)}...`
                          : orden.observaciones}
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '4px',
                            fontSize: '10px',
                            color: '#007bff',
                            fontWeight: 'bold',
                          }}
                        >
                          👁️
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
                    )}
                  </td>

                  <td>
                    <div className="imagenes-preview">
                      {(() => {
                        const imagenesDeOrden = imagenesOrdenes[orden.pk_id_orden];
                        console.log(`Imágenes para orden ${orden.pk_id_orden}:`, imagenesDeOrden); // Debug
                        console.log('Todas las imágenes disponibles:', imagenesOrdenes); // Debug
                        return imagenesDeOrden ? (
                          imagenesDeOrden.map((imagen, index) => (
                            <img
                              key={index}
                              src={imagen.preview}
                              alt={`Imagen ${index + 1}`}
                              title="Hacer clic para ver imagen completa"
                              className="imagen-miniatura"
                              onClick={() => openImageModal(imagen, orden.pk_id_orden)}
                              style={{ cursor: 'pointer' }}
                              onError={(e) => {
                                console.error('Error cargando miniatura:', e);
                                e.target.style.display = 'none';
                                const errorSpan = document.createElement('span');
                                errorSpan.textContent = '❌';
                                errorSpan.title = 'Imagen no disponible';
                                errorSpan.style.cssText =
                                  'color: #999; font-size: 12px; margin: 2px;';
                                e.target.parentNode.appendChild(errorSpan);
                              }}
                            />
                          ))
                        ) : (
                          <span className="sin-imagenes">Sin imágenes</span>
                        );
                      })()}
                    </div>
                  </td>

                  <td>
                    <select
                      className="acciones-select"
                      defaultValue="Acciones"
                      onChange={(e) => {
                        const accion = e.target.value;
                        if (accion === 'Ver') verOrden(orden.pk_id_orden);
                        else if (accion === 'Editar') editarOrden(orden.pk_id_orden);
                        else if (accion === 'Eliminar') {
                          confirmarEliminacion(orden.pk_id_orden);
                        }
                        e.target.value = 'Acciones';
                      }}
                    >
                      <option disabled>Acciones</option>
                      <option value="Ver">Visualizar</option>
                      <option value="Editar">Editar</option>
                      <option value="Eliminar">Eliminar</option>
                    </select>
                  </td>

                  <td>
                    <select
                      className="acciones-select"
                      defaultValue="🔔"
                      onChange={(e) => {
                        handleNotificacionChange(orden, e.target.value);
                        e.target.value = '🔔';
                      }}
                    >
                      <option disabled>🔔</option>
                      {!notificacionesEstado[orden.pk_id_orden]?.tieneNotificacion && (
                        <option value="Crear">Crear</option>
                      )}
                      {notificacionesEstado[orden.pk_id_orden]?.tieneNotificacion && (
                        <>
                          <option value="Mostrar">Mostrar</option>
                          <option value="Editar">Editar</option>
                          <option value="Eliminar">Eliminar</option>
                        </>
                      )}
                    </select>
                  </td>

                  <td className="text-center">
                    <div
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      {(() => {
                        const estado = notificacionesEstado[orden.pk_id_orden];
                        if (!estado || !estado.tieneNotificacion) {
                          return <span style={{ color: '#666', fontStyle: 'italic' }}>—</span>;
                        }
                        return estado.estado === 'activa' ? (
                          <span
                            style={{
                              color: '#22c55e',
                              fontWeight: 'bold',
                              backgroundColor: '#dcfce7',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                            }}
                          >
                            Activa
                          </span>
                        ) : (
                          <span
                            style={{
                              color: '#ef4444',
                              fontWeight: 'bold',
                              backgroundColor: '#fef2f2',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                            }}
                          >
                            Inactiva
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: 'center', padding: '16px', color: '#666' }}
                >
                  No hay registros disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📑 Paginación (copiado de notificaciones) */}
      <div className="pagination-container">
        {/* Izquierda → selector de cantidad */}
        <div className="page-size-selector">
          <label htmlFor="pageSize">Mostrar</label>
          <select
            id="pageSize"
            className="acciones-select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>registros por página</span>
        </div>

        {/* Centro → información de rangos */}
        <span className="pagination-info">
          Mostrando {startIndex + 1} – {endIndex} de {filtered.length}
        </span>

        {/* Derecha → controles de navegación */}
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            data-tooltip="Primera página"
          >
            <FaAngleDoubleLeft />
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            data-tooltip="Página anterior"
          >
            <FaAngleLeft />
          </button>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              let page = Number(e.target.value);
              if (page > totalPages) page = totalPages;
              if (page < 1) page = 1;
              setCurrentPage(page);
            }}
            className="page-input"
          />

          <span>/ {totalPages}</span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            data-tooltip="Página siguiente"
          >
            <FaAngleRight />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            data-tooltip="Última página"
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      </div>

      {/* PopUp para mensajes */}
      <PopUp
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        showButtons={popup.showButtons}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        onConfirm={popup.onConfirm}
        onCancel={popup.onCancel}
        autoClose={popup.type === 'success' && !popup.showButtons}
        autoCloseDelay={3000}
      />

      {/* Modal para visualizar imágenes */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeImageModal}
        image={modalImage}
        images={
          modalImage
            ? imagenesOrdenes[
                Object.keys(imagenesOrdenes).find((id) =>
                  imagenesOrdenes[id]?.some(
                    (img) =>
                      img.id === modalImage.id ||
                      img.url === modalImage.url ||
                      img.preview === modalImage.preview
                  )
                )
              ] || []
            : []
        }
      />

      {/* Modal para visualizar observaciones */}
      {isModalObservacionesOpen && modalObservaciones && (
        <div className="modal" onClick={closeObservacionesModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <span className="modal-icon">📝</span>
                Observaciones - Orden #{modalObservaciones.correlativo}
              </h3>
              <button
                onClick={closeObservacionesModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                {modalObservaciones.texto}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeObservacionesModal} className="btn-primary">
                <span className="btn-icon">✅</span>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para visualizar notificación */}
      {modalVisible && notificacionSeleccionada && (
        <div className="modal" onClick={() => setModalVisible(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <span className="modal-icon">🔔</span>
                Detalles de la Notificación
              </h3>
              <span
                className={`badge ${
                  notificacionSeleccionada.fk_id_categoria_notificacion === 2
                    ? 'badge-promocion'
                    : 'badge-recordatorio'
                }`}
              >
                {notificacionSeleccionada.fk_id_categoria_notificacion === 2
                  ? 'Promoción'
                  : 'Recordatorio'}
              </span>
            </div>

            <div className="modal-body">
              {/* Información de la Orden Asociada */}
              {(notificacionSeleccionada.correlativo_orden ||
                notificacionSeleccionada.nombre_orden) && (
                <div className="modal-section">
                  <h4 className="section-title">
                    <span className="section-icon">📋</span>
                    Orden Asociada
                  </h4>
                  <div className="info-grid">
                    {notificacionSeleccionada.correlativo_orden && (
                      <div className="info-item">
                        <span className="info-label">No. Orden:</span>
                        <span className="info-value">
                          {notificacionSeleccionada.correlativo_orden}
                        </span>
                      </div>
                    )}
                    {notificacionSeleccionada.nombre_orden && (
                      <div className="info-item">
                        <span className="info-label">Paciente:</span>
                        <span className="info-value">{notificacionSeleccionada.nombre_orden}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información Básica */}
              <div className="modal-section">
                <h4 className="section-title">
                  <span className="section-icon">📝</span>
                  Información Básica
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">
                      {notificacionSeleccionada.pk_id_notificacion}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Título:</span>
                    <span className="info-value">{notificacionSeleccionada.titulo}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Descripción:</span>
                    <span className="info-value">{notificacionSeleccionada.descripcion}</span>
                  </div>
                </div>
              </div>

              {/* Configuración */}
              <div className="modal-section">
                <h4 className="section-title">
                  <span className="section-icon">⚙️</span>
                  Configuración
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Módulo:</span>
                    <span className="info-value">📋 Órdenes</span>
                  </div>

                  {notificacionSeleccionada.fk_id_categoria_notificacion === 2 ? (
                    <>
                      <div className="info-item">
                        <span className="info-label">Fecha Inicio:</span>
                        <span className="info-value">
                          {notificacionSeleccionada.fecha_objetivo
                            ? new Date(notificacionSeleccionada.fecha_objetivo).toLocaleDateString(
                                'es-ES'
                              )
                            : '—'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Fecha Fin:</span>
                        <span className="info-value">
                          {notificacionSeleccionada.fecha_fin
                            ? new Date(notificacionSeleccionada.fecha_fin).toLocaleDateString(
                                'es-ES'
                              )
                            : '—'}
                        </span>
                      </div>
                      {notificacionSeleccionada.fecha_objetivo &&
                        notificacionSeleccionada.fecha_fin && (
                          <div className="info-item">
                            <span className="info-label">Duración:</span>
                            <span className="info-value">
                              {Math.ceil(
                                (new Date(notificacionSeleccionada.fecha_fin) -
                                  new Date(notificacionSeleccionada.fecha_objetivo)) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              días
                            </span>
                          </div>
                        )}
                    </>
                  ) : (
                    <>
                      <div className="info-item">
                        <span className="info-label">Intervalo:</span>
                        <span className="info-value">
                          {notificacionSeleccionada.intervalo_dias} días
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Tipo:</span>
                        <span className="info-value">
                          {notificacionSeleccionada.tipo_intervalo === 'antes_entrega'
                            ? '⏰ Antes de entrega'
                            : '📥 Después de recepción'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Configuración de Email */}
              {notificacionSeleccionada.enviar_email === 1 && (
                <div className="modal-section">
                  <h4 className="section-title">
                    <span className="section-icon">📧</span>
                    Configuración de Email
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Asunto:</span>
                      <span className="info-value">
                        {notificacionSeleccionada.asunto_email || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item full-width">
                      <span className="info-label">Cuerpo:</span>
                      <span className="info-value">
                        {notificacionSeleccionada.cuerpo_email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setModalVisible(false)} className="btn-primary">
                <span className="btn-icon">✅</span>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminación de notificación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </div>
  );
};

export default OrdenTrabajo;
