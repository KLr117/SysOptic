import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getNotificaciones,
  deleteNotificacion
} from "../services/notificaciones.js";
import "../styles/vista-notificaciones.css";
import "../styles/alerts.css";
import "../styles/form-errors.css";
import "../styles/pagination-tooltips.css";
import "../styles/tables.css";
import ConfirmModal from "../components/confirmModal.jsx";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";


const intervaloLabels = {
  despues_registro: "Días después de la fecha de registro",
  antes_entrega: "Días antes de la fecha de entrega",
  despues_recepcion: "Días después de la fecha de recepción"
};

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  // 🔍 Búsqueda
  useEffect(() => {
    const result = notificaciones.filter((n) =>
      n.titulo.toLowerCase().includes(search.toLowerCase()) ||
      n.descripcion.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1); // reset a primera página
  }, [search, notificaciones]);

  // 📑 Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const currentData = filtered.slice(startIndex, endIndex);

  // 🗑️ Eliminar con confirmación
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteNotificacion(selectedId);
      await fetchNotificaciones();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedId(null);
    }
  };

  const handleView = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setModalVisible(true);
  };

  return (
    <div className="notificaciones-container">
      <h2>Módulo de Notificaciones</h2>

      {successMessage && <div className="success-banner">{successMessage}</div>}

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
        />
      </div>

      {/* Loader */}
      {loading ? (
        <div className="loader">⏳ Cargando notificaciones...</div>
      ) : (
        <>
          {/* Tabla unificada con tables.css */}
          <div className="table-wrapper">
          <table className="table table-notificaciones">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Módulo</th>
                <th>Intervalo (días)</th>
                <th>Tipo Intervalo</th>
                <th>Fecha Creación</th>
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
                  <td>{new Date(n.fecha_creacion).toLocaleDateString()}</td>
                  <td>
                    <div className="dropdown">
                      <button className="dropbtn">Acciones ▾</button>
                      <div className="dropdown-content">
                        <button onClick={() => handleView(n)}>Visualizar</button>
                        <button onClick={() => navigate(`/notificaciones/editar/${n.pk_id_notificacion}`)}>
                          Editar
                        </button>
                        <button onClick={() => handleDeleteClick(n.pk_id_notificacion)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

         {/* 📑 Paginación */}
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


        </>
      )}

      {/* Modal ver detalle */}
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
            <p><strong>Intervalo:</strong> {notificacionSeleccionada.intervalo_dias} días</p>
            <p><strong>Tipo Intervalo:</strong> {intervaloLabels[notificacionSeleccionada.tipo_intervalo]}</p>
            {notificacionSeleccionada.fecha_fin && (
              <p><strong>Fecha Fin:</strong> {notificacionSeleccionada.fecha_fin}</p>
            )}
            {notificacionSeleccionada.enviar_email === 1 && (
              <>
                <p><strong>Asunto Email:</strong> {notificacionSeleccionada.asunto_email}</p>
                <p><strong>Cuerpo Email:</strong> {notificacionSeleccionada.cuerpo_email}</p>
              </>
            )}
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
    </div>
  );
};

export default Notificaciones;
