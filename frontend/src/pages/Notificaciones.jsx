import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getNotificaciones,
  deleteNotificacion
} from "../services/notificaciones.js";
import "../styles/vista-notificaciones.css";
import "../styles/alerts.css";
import "../styles/form-errors.css";
import ConfirmModal from "../components/confirmModal.jsx";

const intervaloLabels = {
  despues_registro: "Días después de la fecha de registro",
  antes_entrega: "Días antes de la fecha de entrega",
  despues_recepcion: "Días después de la fecha de recepción"
};

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // 👈 para el banner

  const navigate = useNavigate();
  const location = useLocation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Abrir modal eliminar
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirmar eliminar
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

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  // Si venimos con mensaje de éxito desde otra vista
    useEffect(() => {
      if (location.state?.successMessage) {
        setSuccessMessage(location.state.successMessage);
        setTimeout(() => setSuccessMessage(""), 3000);

        // limpiar el state para que no reaparezca si refrescan
        navigate(location.pathname, { replace: true, state: {} });
      }
    }, [location, navigate]);

  const fetchNotificaciones = async () => {
    try {
      const data = await getNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotificacion(id);
      await fetchNotificaciones();
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  const handleView = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setModalVisible(true);
  };

  return (
    <div className="notificaciones-container">
      <h2>Módulo de Notificaciones</h2>

      {successMessage && <div className="success-banner">{successMessage}</div>} {/* 👈 banner */}

      <button
        className="btn-agregar"
        onClick={() => navigate("/notificaciones/nueva")}
      >
        ➕ Nueva Notificación
      </button>

      {/* Tabla */}
      <table className="notificaciones-table">
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
          {notificaciones.map((n) => (
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

      {/* Modal */}
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
