import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getNotificaciones,
  deleteNotificacion,
  updateEstadoNotificacion,
} from "../services/notificaciones.js";
import "../styles/vista-notificaciones.css";
import "../styles/alerts.css";
import "../styles/form-errors.css";
import "../styles/pagination-tooltips.css";
import "../styles/tables.css";
import ConfirmModal from "../components/confirmModal.jsx";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

const intervaloLabels = {
  despues_registro: "Días después de la fecha de registro",
  antes_entrega: "Días antes de la fecha de entrega",
  despues_recepcion: "Días después de la fecha de recepción",
};

const estadoLabels = {
  1: "Activa",
  2: "Inactiva",
  3: "Cancelada",
};

const estadoClassMap = {
  1: "estado-activa",
  2: "estado-inactiva",
  3: "estado-cancelada",
};

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Ordenamiento
  const [sortField, setSortField] = useState("fecha_creacion");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortOption, setSortOption] = useState("recientes");

  // Paginación
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [inputError, setInputError] = useState(false);

  // Modales
  const [modalVisible, setModalVisible] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [estadoModalOpen, setEstadoModalOpen] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => setSuccessMessage(""), 3000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await getNotificaciones();
      setNotificaciones(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda
  useEffect(() => {
    const q = search.toLowerCase();
    const result = notificaciones.filter(
      (n) =>
        (n.titulo || "").toLowerCase().includes(q) ||
        (n.descripcion || "").toLowerCase().includes(q)
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, notificaciones]);

  // Ordenamiento
  const sortData = (data) => {
    let result = [...data];
    const dir = sortDirection === "asc" ? 1 : -1;

    result.sort((a, b) => {
      if (sortField === "id") return dir * (a.pk_id_notificacion - b.pk_id_notificacion);
      if (sortField === "titulo")
        return dir * (a.titulo || "").localeCompare(b.titulo || "");
      if (sortField === "categoria")
        return dir * (a.nombre_categoria || "").localeCompare(b.nombre_categoria || "");
      if (sortField === "modulo")
        return dir * (a.nombre_modulo || "").localeCompare(b.nombre_modulo || "");
      if (sortField === "fecha_creacion")
        return dir * (new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
      if (sortField === "intervalo_dias")
        return dir * ((a.intervalo_dias || 0) - (b.intervalo_dias || 0));
      return 0;
    });

    return result;
  };

  const sortedData = sortData(filtered);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedData.length);
  const currentData = sortedData.slice(startIndex, endIndex);

  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  // Asegurar rango
  useEffect(() => {
    const total = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > total) setCurrentPage(total);
  }, [filtered, pageSize]);

  // Eliminar
  const handleDeleteClick = (noti) => {
    setSelectedNoti(noti);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteNotificacion(selectedNoti.pk_id_notificacion);
      await fetchNotificaciones();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedNoti(null);
    }
  };

  // Cambiar estado
  const handleEstadoClick = (notificacion, action) => {
    setSelectedNoti(notificacion);
    setModalAction(action);
    setEstadoModalOpen(true);
  };

  // ⚙️ Confirmar acción de cambio de estado
  const confirmEstadoChange = async () => {
    if (!selectedNoti) return;

    try {
      if (modalAction === "desactivar") {
        // 2 = inactiva
        await updateEstadoNotificacion(selectedNoti.pk_id_notificacion, 2);
        await fetchNotificaciones();
        setSuccessMessage("Notificación desactivada.");
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        // "reactivar": NO tocamos el estado aquí.
        // Solo navegamos al formulario con la intención de reactivar.
        navigate(`/notificaciones/editar/${selectedNoti.pk_id_notificacion}`, {
          state: {
            reactivateIntent: true,
            successMessage:
              "Revise la configuración antes de reactivar esta notificación.",
          },
        });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setEstadoModalOpen(false);
      setSelectedNoti(null);
      setModalAction(null);
    }
  };

  const handleView = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setModalVisible(true);
  };

  // Ordenar encabezado
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortArrow = (field) =>
    sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "↕";

  // Dropdown acciones
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (id) =>
    setOpenDropdownId((prev) => (prev === id ? null : id));
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) setOpenDropdownId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Paginación input
  const commitPageInput = () => {
    let val = parseInt(pageInput, 10);
    if (!Number.isInteger(val) || val < 1 || val > totalPages) {
      setInputError(true);
      setPageInput(String(currentPage));
      setTimeout(() => setInputError(false), 1500);
      return;
    }
    setCurrentPage(val);
  };
  const handlePageInput = (e) => {
    const val = parseInt(e.currentTarget.value, 10);
    setPageInput(e.currentTarget.value);
    if (Number.isInteger(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val);
    }
  };

  const getEstadoLabel = (n) =>
    n?.nombre_estado ||
    estadoLabels[n?.fk_id_estado_notificacion] ||
    "Desconocido";

  const getEstadoClass = (n) =>
    estadoClassMap[n?.fk_id_estado_notificacion] || "estado-cancelada";

  const isActiva = (n) =>
    (n?.fk_id_estado_notificacion ?? 0) === 1 ||
    (n?.nombre_estado || "").toLowerCase() === "activa";

  return (
    <div className="notificaciones-container">
      <h2>Módulo de Notificaciones</h2>

      {successMessage && <div className="success-banner">{successMessage}</div>}

      {/* Barra de acciones */}
      <div className="table-actions">
        <button
          className="btn-agregar"
          onClick={() => navigate("/notificaciones/nueva")}
        >
          ➕ Nueva Notificación
        </button>

        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
          data-tooltip="Filtra por título o descripción"
        />

        <div className="sort-container">
          <label htmlFor="sortSelect" className="sort-label">
            Ordenar por:
          </label>
          <select
            id="sortSelect"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-combobox"
            data-tooltip="Selecciona una ordenación rápida"
          >
            <option value="recientes">Más recientes primero</option>
            <option value="antiguos">Más antiguos primero</option>
            <option value="tituloAZ">Título A → Z</option>
            <option value="tituloZA">Título Z → A</option>
            <option value="tipo">Por tipo</option>
            <option value="intervaloAsc">Intervalo ↑</option>
            <option value="intervaloDesc">Intervalo ↓</option>
          </select>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="loader">⏳ Cargando notificaciones...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table table-notificaciones">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("id")}>ID {renderSortArrow("id")}</th>
                  <th onClick={() => toggleSort("titulo")}>Título {renderSortArrow("titulo")}</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th onClick={() => toggleSort("categoria")}>Categoría {renderSortArrow("categoria")}</th>
                  <th onClick={() => toggleSort("modulo")}>Módulo {renderSortArrow("modulo")}</th>
                  <th onClick={() => toggleSort("intervalo_dias")}>Intervalo (días) {renderSortArrow("intervalo_dias")}</th>
                  <th>Tipo Intervalo</th>
                  <th onClick={() => toggleSort("fecha_creacion")}>Fecha Creación {renderSortArrow("fecha_creacion")}</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((n) => (
                  <tr key={n.pk_id_notificacion}>
                    <td>{n.pk_id_notificacion}</td>
                    <td>{n.titulo}</td>
                    <td>{n.descripcion}</td>
                    <td>{n.nombre_tipo}</td>
                    <td>{n.nombre_categoria}</td>
                    <td>{n.nombre_modulo}</td>
                    <td>{n.intervalo_dias}</td>
                    <td>{intervaloLabels[n.tipo_intervalo]}</td>
                    <td>{n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleDateString() : ""}</td>
                    <td>
                      <span className={`estado-badge ${getEstadoClass(n)}`}>
                        {getEstadoLabel(n)}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="dropbtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(n.pk_id_notificacion);
                          }}
                          data-tooltip="Acciones disponibles"
                        >
                          Acciones ▾
                        </button>
                        {openDropdownId === n.pk_id_notificacion && (
                          <div className="dropdown-content">
                            <button onClick={() => handleView(n)}>Visualizar</button>
                            <button onClick={() => navigate(`/notificaciones/editar/${n.pk_id_notificacion}`)}>
                              Editar
                            </button>
                            {isActiva(n) ? (
                              <button onClick={() => handleEstadoClick(n, "desactivar")}>Desactivar</button>
                            ) : (
                              <button onClick={() => handleEstadoClick(n, "reactivar")}>Reactivar</button>
                            )}
                            <button onClick={() => handleDeleteClick(n)}>Eliminar</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="pagination-container">
            <div className="page-size-selector">
              <label htmlFor="pageSize">Mostrar</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                data-tooltip="Filas por página"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>registros por página</span>
            </div>

            <span className="pagination-info">
              Mostrando {startIndex + 1} – {endIndex} de {filtered.length}
            </span>

            <div className="pagination-controls">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                data-tooltip="Primera página">
                <FaAngleDoubleLeft />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                data-tooltip="Página anterior">
                <FaAngleLeft />
              </button>
              <span data-tooltip = "Ir a página especifica">
              <div>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  step="1"
                  value={pageInput}
                  onInput={handlePageInput}
                  onBlur={commitPageInput}
                  onKeyDown={(e) => e.key === "Enter" && commitPageInput()}
                  className={`page-input ${inputError ? "input-error" : ""}`}
                />
              </div>
              </span>
              <span>/ {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                data-tooltip ="Página siguiente">
                <FaAngleRight />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                data-tooltip="Última página">
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal detalle */}
      {modalVisible && notificacionSeleccionada && (
        <div className="modal">
          <div className="modal-content">
            <h3>Detalles de la Notificación</h3>
            <p><strong>ID:</strong> {notificacionSeleccionada.pk_id_notificacion}</p>
            <p><strong>Título:</strong> {notificacionSeleccionada.titulo}</p>
            <p><strong>Descripción:</strong> {notificacionSeleccionada.descripcion}</p>
            <p><strong>Tipo:</strong> {notificacionSeleccionada.nombre_tipo}</p>
            <p><strong>Categoría:</strong> {notificacionSeleccionada.nombre_categoria}</p>
            <p><strong>Módulo:</strong> {notificacionSeleccionada.nombre_modulo}</p>
            <p><strong>Intervalo:</strong> {notificacionSeleccionada.intervalo_dias}</p>
            <p><strong>Tipo Intervalo:</strong> {intervaloLabels[notificacionSeleccionada.tipo_intervalo]}</p>
            <p><strong>Fecha Creación:</strong> {notificacionSeleccionada.fecha_creacion ? new Date(notificacionSeleccionada.fecha_creacion).toLocaleDateString() : ""}</p>
            <p><strong>Estado:</strong> 
              <span className={`estado-badge ${getEstadoClass(notificacionSeleccionada)}`}>
                {getEstadoLabel(notificacionSeleccionada)}
              </span>
            </p>
            <button onClick={() => setModalVisible(false)} className="btn-cerrar">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Notificación"
        message="¿Estás seguro de que deseas eliminar esta notificación?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Modal de estado */}
      <ConfirmModal
        isOpen={estadoModalOpen}
        title={modalAction === "desactivar" ? "Desactivar Notificación" : "Reactivar Notificación"}
        message={
          modalAction === "desactivar"
            ? "¿Está seguro de que desea desactivar esta notificación? Podrá reactivarla más adelante."
            : "Antes de reactivar esta notificación, asegúrese de revisar su configuración. ¿Desea continuar?"
        }
        onConfirm={confirmEstadoChange}
        onCancel={() => setEstadoModalOpen(false)}
      />
    </div>
  );
};

export default Notificaciones;
