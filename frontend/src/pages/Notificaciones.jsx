import React, { useState, useEffect } from "react";
import {
  getNotificaciones,
  createNotificacion,
  deleteNotificacion
} from "../services/notificaciones.js";
import "../styles/vista-notificaciones.css";
import "../styles/form-errors.css"; // estilos para mensajes de error

const intervaloLabels = {
  despues_registro: "Días después de la fecha de registro",
  antes_entrega: "Días antes de la fecha de entrega",
  despues_recepcion: "Días después de la fecha de recepción"
};


const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    intervaloCantidad: 1,
    intervaloUnidad: "dias",
    tipoIntervalo: "",
    categoria: "",
    fechaFin: "",
    enviarEmail: true,
    asuntoEmail: "",
    cuerpoEmail: "",
    modulo: "",
    tipo: "General"
  });

  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // Estado para mensaje de éxito
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensaje de error

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const data = await getNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = "Debe ingresar un título";
    if (!formData.descripcion.trim()) newErrors.descripcion = "Debe ingresar una descripción";
    if (!formData.categoria) newErrors.categoria = "Debe seleccionar una categoría";
    if (!formData.modulo) newErrors.modulo = "Debe seleccionar un módulo";
    if (!formData.tipoIntervalo) newErrors.tipoIntervalo = "Debe elegir cuándo se enviará";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let dias = parseInt(formData.intervaloCantidad);
    if (formData.intervaloUnidad === "semanas") dias *= 7;
    if (formData.intervaloUnidad === "meses") dias *= 30;
    if (formData.intervaloUnidad === "anios") dias *= 365;

    const payload = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fechaFin: formData.categoria === "Promoción" ? formData.fechaFin : null,
      intervaloDias: dias,
      tipo_intervalo: formData.tipoIntervalo,
      fk_id_categoria_notificacion: formData.categoria === "Recordatorio" ? 1 : 2,
      enviarEmail: formData.enviarEmail,
      asuntoEmail: formData.asuntoEmail,
      cuerpoEmail: formData.cuerpoEmail,
      fk_id_tipo_notificacion: formData.tipo === "General" ? 1 : 2,
      fk_id_modulo_notificacion: formData.modulo === "Expedientes" ? 1 : 2,
      fk_id_estado_notificacion: 1,
      fk_id_expediente: null,
      fk_id_orden: null
    };

    try {
      await createNotificacion(payload);
      await fetchNotificaciones();
      setFormData({
        titulo: "",
        descripcion: "",
        intervaloCantidad: 1,
        intervaloUnidad: "dias",
        tipoIntervalo: "",
        categoria: "",
        fechaFin: "",
        enviarEmail: true,
        asuntoEmail: "",
        cuerpoEmail: "",
        modulo: "",
        tipo: "General"
      });
      setErrors({});
      setSuccessMessage("✅ Notificación creada con éxito");
      setTimeout(() => setSuccessMessage(""), 3000); // se oculta en 3s
    } catch (error) {
        console.error("Error al crear notificación:", error);
        setErrorMessage("❌ Ocurrió un error al guardar la notificación");
        setTimeout(() => setErrorMessage(""), 4000);
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

      {successMessage && <div className="success-banner">{successMessage}</div>}{ /* Banner de éxito*/}
      {errorMessage && <div className="error-banner">{errorMessage}</div>}{/* Banner de error */}

      {/* Formulario */}
      <form className="notificaciones-form" onSubmit={handleSubmit}>
        {/* Título */}
        <div className="form-row">
          <label>Título:</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
          />
          {errors.titulo && <span className="error">{errors.titulo}</span>}
        </div>

        {/* Descripción */}
        <div className="form-row">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />
          {errors.descripcion && <span className="error">{errors.descripcion}</span>}
        </div>

        {/* Categoría */}
        <div className="form-row">
          <label>Categoría:</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          >
            <option value="">Seleccione categoría...</option>
            <option value="Recordatorio">Recordatorio</option>
            <option value="Promoción">Promoción</option>
          </select>
          {errors.categoria && <span className="error">{errors.categoria}</span>}
        </div>

        {/* Fecha fin - solo si es promoción */}
        {formData.categoria === "Promoción" && (
          <div className="form-row">
            <label>Fecha Fin:</label>
            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Módulo */}
        <div className="form-row">
          <label>Módulo:</label>
          <select
            name="modulo"
            value={formData.modulo}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                modulo: value,
                tipoIntervalo: ""
              });
            }}
          >
            <option value="">Seleccione módulo...</option>
            <option value="Expedientes">Expedientes</option>
            <option value="Ordenes">Órdenes</option>
          </select>
          {errors.modulo && <span className="error">{errors.modulo}</span>}
        </div>

        {/* Tipo de intervalo contextual */}
        <div className="form-row">
          <label>¿Cuándo se enviará?</label>
          {formData.modulo === "Expedientes" && (
            <p className="static-label">
              X días después de la fecha de registro
            </p>
          )}
          {formData.modulo === "Ordenes" && (
            <select
              name="tipoIntervalo"
              value={formData.tipoIntervalo}
              onChange={handleChange}
            >
              <option value="">Seleccione opción...</option>
              <option value="antes_entrega">X días antes de la fecha de entrega</option>
              <option value="despues_recepcion">X días después de la fecha de recepción</option>
            </select>
          )}
          {errors.tipoIntervalo && <span className="error">{errors.tipoIntervalo}</span>}
        </div>

        {/* Intervalo */}
        <div className="form-row">
          <label>Intervalo:</label>
          <div className="intervalo-container">
            <input
              type="number"
              name="intervaloCantidad"
              value={formData.intervaloCantidad}
              onChange={handleChange}
              min="1"
            />
            <select
              name="intervaloUnidad"
              value={formData.intervaloUnidad}
              onChange={handleChange}
            >
              <option value="dias">Días</option>
              <option value="semanas">Semanas</option>
              <option value="meses">Meses</option>
              <option value="anios">Años</option>
            </select>
          </div>
        </div>

        {/* Enviar correo */}
        <div className="form-row">
          <label>
            <input
              type="checkbox"
              name="enviarEmail"
              checked={formData.enviarEmail}
              onChange={handleChange}
            />
            ¿Enviar correo al cliente?
          </label>
        </div>

        {formData.enviarEmail && (
          <>
            <div className="form-row">
              <label>Asunto del correo:</label>
              <input
                type="text"
                name="asuntoEmail"
                value={formData.asuntoEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Cuerpo del correo:</label>
              <textarea
                name="cuerpoEmail"
                value={formData.cuerpoEmail}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <button type="submit" className="btn-agregar">
          Agregar Notificación
        </button>
      </form>

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
                    <button onClick={() => handleDelete(n.pk_id_notificacion)}>
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
    </div>
  );
};

export default Notificaciones;
