import React, { useState } from "react";
import "../styles/vista-notificaciones.css";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [formData, setFormData] = useState({
    numero: "",
    titulo: "",
    descripcion: "",
    fechaObjetivo: "",
    intervaloDias: "",
    tipo: "General",
    modulo: "Expedientes"
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);

  // Manejo de cambios en formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Crear notificación
  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevaNotificacion = {
      id: notificaciones.length + 1,
      ...formData,
      fechaCreacion: new Date().toLocaleDateString()
    };
    setNotificaciones([...notificaciones, nuevaNotificacion]);
    setFormData({
      numero: "",
      titulo: "",
      descripcion: "",
      fechaObjetivo: "",
      intervaloDias: "",
      tipo: "General",
      modulo: "Expedientes"
    });
  };

  // Eliminar
  const handleDelete = (id) => {
    setNotificaciones(notificaciones.filter((n) => n.id !== id));
  };

  // Visualizar
  const handleView = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setModalVisible(true);
  };

  return (
    <div className="notificaciones-container">
      <h2>Módulo de Notificaciones</h2>

      {/* Formulario */}
      <form className="notificaciones-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Número:</label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Título:</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Fecha Objetivo:</label>
          <input
            type="date"
            name="fechaObjetivo"
            value={formData.fechaObjetivo}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Intervalo:</label>
           <div className="intervalo-container">
          <input
            type="number"
            name="intervaloCantidad"
            value={formData.intervaloCantidad}
            onChange={handleChange}
            min="1"
            className="intervalo-input"
          />
          <select
            name="intervaloUnidad"
            value={formData.intervaloUnidad}
            onChange={handleChange}
            className="intervalo-select"
          >
            <option value="dias">Días</option>
            <option value="meses">Meses</option>
            <option value="anios">Años</option>
          </select>
          </div>
        </div>


        <div className="form-row">
          <label>Tipo:</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Específica">Específica</option>
          </select>
        </div>

        <div className="form-row">
          <label>Módulo:</label>
          <select name="modulo" value={formData.modulo} onChange={handleChange}>
            <option value="Expedientes">Expedientes</option>
            <option value="Orden de Trabajo">Orden de Trabajo</option>
          </select>
        </div>

        <button type="submit" className="btn-agregar">
          Agregar Notificación
        </button>
      </form>

      {/* Tabla */}
      <table className="notificaciones-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Módulo</th>
            <th>Intervalo (días)</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {notificaciones.map((n) => (
            <tr key={n.id}>
              <td>{n.numero}</td>
              <td>{n.titulo}</td>
              <td>{n.descripcion}</td>
              <td>{n.tipo}</td>
              <td>{n.modulo}</td>
              <td>{n.intervaloDias}</td>
              <td>{n.fechaCreacion}</td>
              <td>
                <div className="dropdown">
                  <button className="dropbtn">Acciones ▾</button>
                  <div className="dropdown-content">
                    <button onClick={() => handleView(n)}>Visualizar</button>
                    <button onClick={() => alert("Editar en construcción")}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(n.id)}>Eliminar</button>
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
            <p><strong>Número:</strong> {notificacionSeleccionada.numero}</p>
            <p><strong>Título:</strong> {notificacionSeleccionada.titulo}</p>
            <p><strong>Descripción:</strong> {notificacionSeleccionada.descripcion}</p>
            <p><strong>Tipo:</strong> {notificacionSeleccionada.tipo}</p>
            <p><strong>Módulo:</strong> {notificacionSeleccionada.modulo}</p>
            <p><strong>Fecha Objetivo:</strong> {notificacionSeleccionada.fechaObjetivo}</p>
            <p><strong>Intervalo:</strong> {notificacionSeleccionada.intervaloDias} días</p>
            <button onClick={() => setModalVisible(false)} className="btn-cerrar">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
