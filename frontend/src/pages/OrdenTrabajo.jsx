import React, { useState, useEffect } from "react";
import "../styles/orden-trabajo.css";
import "../styles/table-responsive.css";
import "../styles/tables.css";
import "../styles/popup.css";
import "../styles/pagination-tooltips.css";
import "../styles/vista-notificaciones.css";
import Titulo from "../components/Titulo";
import Button from "../components/Button";
import PopUp from "../components/PopUp";
import { useNavigate } from "react-router-dom";
import { getOrdenes, deleteOrden } from "../services/ordenTrabajoService";
import { obtenerTodasLasImagenes } from "../services/imagenesOrdenesService";
import ImageModal from "../components/ImageModal";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";

const OrdenTrabajo = () => {
  const navigate = useNavigate();

  const columns = [
    "No Orden",
    "Paciente",
    "Dirección",
    "Correo",
    "Teléfono",
    "Fecha Recepción",
    "Fecha Entrega",
    "Total",
    "Adelanto",
    "Saldo",
    "Imágenes",
    "Acciones",
    "Notificaciones",
    "Estado",
  ];

  const [ordenesData, setOrdenesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
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

  // Estados para PopUp
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Estado para orden a eliminar
  const [ordenAEliminar, setOrdenAEliminar] = useState(null);

  // Estado para imágenes de órdenes desde la base de datos
  const [imagenesOrdenes, setImagenesOrdenes] = useState({});
  
  // Estado para modal de imagen
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para simular guardado de imágenes
  const guardarImagenesOrden = (ordenId, imagenes) => {
    if (imagenes && imagenes.length > 0) {
      setImagenesOrdenes(prev => ({
        ...prev,
        [ordenId]: imagenes
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
          response.imagenes.forEach(imagen => {
            if (!imagenesAgrupadas[imagen.orden_id]) {
              imagenesAgrupadas[imagen.orden_id] = [];
            }
            imagenesAgrupadas[imagen.orden_id].push({
              id: imagen.id,
              nombre: imagen.nombre_archivo,
              preview: imagen.url, // URL del servidor
              url: imagen.url // URL completa para el modal
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
          setError("Error al cargar las órdenes");
        }
      } catch (err) {
        console.error("Error cargando órdenes:", err);
        setError("Error al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, []);

  const agregarOrden = () => navigate("/agregar-orden-trabajo");
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
      onCancel: () => setOrdenAEliminar(null)
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
            setPopup(prev => ({ ...prev, isOpen: false }));
          }
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
            setPopup(prev => ({ ...prev, isOpen: false }));
          }
        });
      }
    } catch (err) {
      console.error("Error eliminando orden:", err);
      setPopup({
        isOpen: true,
        title: 'Error',
        message: 'Error al eliminar la orden. Intente nuevamente.',
        type: 'error',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => {
          setOrdenAEliminar(null);
          setPopup(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  const handleEstadoChange = (id, value) => {
    // TODO: Implementar actualización de estado en el backend
    console.log("Cambiar estado de orden", id, "a", value);
  };

  const handleNotificacionChange = (id, value) => {
    // TODO: Implementar actualización de notificación en el backend
    console.log("Cambiar notificación de orden", id, "a", value);
  };


  // 🔍 Búsqueda y filtrado
  const [filtered, setFiltered] = useState([]);
  
  useEffect(() => {
    const result = ordenesData.filter((orden) => {
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
          day: '2-digit'
        });
      };

      // Búsqueda en diferentes campos (normalizada)
      const busquedaPaciente = normalizarTexto(orden.paciente || "").includes(normalizarTexto(filtro));
      const busquedaTelefono = (orden.telefono || "").toLowerCase().includes(filtro);
      const busquedaCorreo = normalizarTexto(orden.correo || "").includes(normalizarTexto(filtro));
      const busquedaDireccion = normalizarTexto(orden.direccion || "").includes(normalizarTexto(filtro));
      const busquedaId = (orden.pk_id_orden || "").toString().includes(filtro);
      
      // Búsqueda en fechas (formato DD/MM/YYYY)
      const fechaRecepcionFormateada = formatearFecha(orden.fecha_recepcion);
      const fechaEntregaFormateada = formatearFecha(orden.fecha_entrega);
      const busquedaFechaRecepcion = fechaRecepcionFormateada.includes(filtro);
      const busquedaFechaEntrega = fechaEntregaFormateada.includes(filtro);
      
      // Búsqueda en totales (formato numérico)
      const busquedaTotal = (orden.total || "").toString().includes(filtro);
      const busquedaAdelanto = (orden.adelanto || "").toString().includes(filtro);
      const busquedaSaldo = (orden.saldo || "").toString().includes(filtro);

      return (
        busquedaPaciente ||
        busquedaTelefono ||
        busquedaCorreo ||
        busquedaDireccion ||
        busquedaId ||
        busquedaFechaRecepcion ||
        busquedaFechaEntrega ||
        busquedaTotal ||
        busquedaAdelanto ||
        busquedaSaldo
      );
    }).sort((a, b) => {
      // Ordenar según combobox
      const dir = sortDirection === "asc" ? 1 : -1;

      if (sortField === "id") return dir * ((a.pk_id_orden || 0) - (b.pk_id_orden || 0));
      if (sortField === "paciente") {
        return dir * ((a.paciente || "").localeCompare(b.paciente || ""));
      }
      if (sortField === "fechaRecepcion" || sortField === "fechaEntrega") {
        const fieldName = sortField === "fechaRecepcion" ? "fecha_recepcion" : "fecha_entrega";
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
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Titulo text="Órdenes de Trabajo" className="titulo" />
          <Button onClick={agregarOrden} className="agregar">
            ➕ Agregar Orden
          </Button>
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
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Titulo text="Órdenes de Trabajo" className="titulo" />
          <Button onClick={agregarOrden} className="agregar">
            ➕ Agregar Orden
          </Button>
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Titulo text="Órdenes de Trabajo" className="titulo" />
        <Button onClick={agregarOrden} className="agregar">
          ➕ Agregar Orden
        </Button>
      </div>

      {/* FILA DE CONTROLES (ARRIBA) */}
      <div className="mb-4 flex justify-center items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-2" style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por paciente, teléfono, correo, fechas, totales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-buscador"
              style={{ width: '100%', paddingLeft: '12px', paddingRight: '12px' }}
            />
          </div>
        </div>
      </div>

      {/* TABLA CON SCROLL HORIZONTAL */}
      <div className="table-container">
        <table className="table orden-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('id')}>No Orden {renderSortArrow('id')}</th>
              <th onClick={() => toggleSort('paciente')}>Paciente {renderSortArrow('paciente')}</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th onClick={() => toggleSort('fechaRecepcion')}>Fecha Recepción {renderSortArrow('fechaRecepcion')}</th>
              <th onClick={() => toggleSort('fechaEntrega')}>Fecha Entrega {renderSortArrow('fechaEntrega')}</th>
              <th>Total</th>
              <th>Adelanto</th>
              <th>Saldo</th>
              <th>Imágenes</th>
              <th>Acciones</th>
              <th>Notificaciones</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenesPaginadas.length > 0 ? (
              ordenesPaginadas.map((orden) => (
                <tr key={orden.pk_id_orden}>
                  <td>{orden.pk_id_orden}</td>
                  <td>{orden.paciente}</td>
                  <td>{orden.direccion}</td>
                  <td>{orden.correo}</td>
                  <td>{orden.telefono}</td>
                  <td>{orden.fecha_recepcion ? new Date(orden.fecha_recepcion).toLocaleDateString('es-ES') : ''}</td>
                  <td>{orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString('es-ES') : ''}</td>
                  <td className="text-right">
                    Q{parseFloat(orden.total || 0).toFixed(2)}
                  </td>
                  <td className="text-right">
                    Q{parseFloat(orden.adelanto || 0).toFixed(2)}
                  </td>
                  <td className="text-right font-semibold saldo-cell">
                    Q{parseFloat(orden.saldo || 0).toFixed(2)}
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
                              title={imagen.nombre}
                              className="imagen-miniatura"
                              onClick={() => openImageModal(imagen, orden.pk_id_orden)}
                              style={{ cursor: 'pointer' }}
                              onError={(e) => {
                                console.error('Error cargando miniatura:', e);
                                e.target.style.display = 'none';
                                const errorSpan = document.createElement('span');
                                errorSpan.textContent = '❌';
                                errorSpan.title = 'Imagen no disponible';
                                errorSpan.style.cssText = 'color: #999; font-size: 12px; margin: 2px;';
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
                      defaultValue="Acciones"
                      onChange={(e) => {
                        const accion = e.target.value;
                        if (accion === "Ver") verOrden(orden.pk_id_orden);
                        else if (accion === "Editar") editarOrden(orden.pk_id_orden);
                        else if (accion === "Eliminar") {
                          confirmarEliminacion(orden.pk_id_orden);
                        }
                        e.target.value = "Acciones";
                      }}
                    >
                      <option disabled>Acciones</option>
                      <option value="Ver">Ver</option>
                      <option value="Editar">Editar</option>
                      <option value="Eliminar">Eliminar</option>
                    </select>
                  </td>

                  <td>
                    <select
                      defaultValue="Crear"
                      onChange={(e) =>
                        handleNotificacionChange(orden.pk_id_orden, e.target.value)
                      }
                    >
                      <option value="Crear">Crear</option>
                      <option value="Mostrar">Mostrar</option>
                      <option value="Editar">Editar</option>
                    </select>
                  </td>

                  <td>
                    <select
                      defaultValue="Pendiente"
                      onChange={(e) =>
                        handleEstadoChange(orden.pk_id_orden, e.target.value)
                      }
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Realizada">Realizada</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: "center", padding: "16px", color: "#666" }}
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
        onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
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
        images={modalImage ? imagenesOrdenes[Object.keys(imagenesOrdenes).find(id => 
          imagenesOrdenes[id]?.some(img => 
            img.id === modalImage.id || 
            img.url === modalImage.url || 
            img.preview === modalImage.preview
          )
        )] || [] : []}
      />
    </div>
  );
};

export default OrdenTrabajo;
