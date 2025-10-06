import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  createNotificacion,
  getNotificacionById,
  updateNotificacion
} from "../services/notificacionesService";
import "../styles/vista-notificaciones.css";
import "../styles/form-errors.css";
import ConfirmModal from "../components/confirmModal";

// ID real de la categoría Promoción en tu catálogo (tu select ya usa "2")
const PROMO_CATEGORY_ID = "2";

// Normaliza string/Date a "YYYY-MM-DD" para <input type="date">
const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
};

const NotificacionForm = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation(); // para saber si venimos a reactivar

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    intervaloCantidad: 1,
    intervaloUnidad: "dias",
    tipoIntervalo: "",
    categoria: "",
    fechaFin: "",           // YYYY-MM-DD
    fechaInicioProm: "",    // YYYY-MM-DD (irá a fecha_objetivo en BD)
    enviarEmail: true,
    asuntoEmail: "",
    cuerpoEmail: "",
    modulo: "",
    tipo: "General"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Cargar datos en edición
  useEffect(() => {
    if (mode === "edit" && id) {
      (async () => {
        try {
          setLoading(true);
          const data = await getNotificacionById(id);
          setFormData({
            titulo: data.titulo || "",
            descripcion: data.descripcion || "",
            intervaloCantidad: data.intervalo_dias || 1,
            intervaloUnidad: "dias", // siempre convertimos a días en BD
            tipoIntervalo: data.tipo_intervalo || "",
            categoria: data.fk_id_categoria_notificacion?.toString() || "",
            fechaFin: toInputDate(data.fecha_fin),          // ✅ normalizado para <input type="date">
            fechaInicioProm: toInputDate(data.fecha_objetivo), 
            enviarEmail: data.enviar_email === 1,
            asuntoEmail: data.asunto_email || "",
            cuerpoEmail: data.cuerpo_email || "",
            modulo: data.fk_id_modulo_notificacion?.toString() || "",
            tipo: data.nombre_tipo || "General"
          });
          setLoading(false);
        } catch (error) {
          console.error("Error al cargar notificación:", error);
          setLoading(false);
        }
      })();
    }
  }, [mode, id]);

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
    if (!formData.descripcion.trim())
      newErrors.descripcion = "Debe ingresar una descripción";
    if (!formData.categoria) newErrors.categoria = "Debe seleccionar una categoría";
    if (!formData.modulo) newErrors.modulo = "Debe seleccionar un módulo";
    if (formData.categoria !== PROMO_CATEGORY_ID && formData.modulo === "2" && !formData.tipoIntervalo) {
     newErrors.tipoIntervalo = "Debe elegir cuándo se enviará";
    }
    if (formData.categoria === PROMO_CATEGORY_ID && !formData.fechaInicioProm) {
      newErrors.fechaInicioProm = "Debe seleccionar una fecha de inicio";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [pendingPayload, setPendingPayload] = useState(null);

// Al intentar guardar cambios → abre modal
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

// 1) Calcular días
  let dias = parseInt(formData.intervaloCantidad, 10);
  if (formData.intervaloUnidad === "semanas") dias *= 7;
  if (formData.intervaloUnidad === "meses") dias *= 30;
  if (formData.intervaloUnidad === "anios") dias *= 365;

// 2) tipo_intervalo válido
  let tipoIntervalo = formData.tipoIntervalo;
  if (formData.categoria !== PROMO_CATEGORY_ID) {
    if (formData.modulo === "1") tipoIntervalo = "despues_registro";
    // en módulo "2" se respeta lo que eligió el usuario (y ya lo validaste)
  } else {
    tipoIntervalo = null; // PROMO no usa intervalos
  }

  // 3) ¿venimos con intención de reactivar?
  const reactivateIntent = !!location.state?.reactivateIntent;

  const payload = {
    titulo: formData.titulo,
    descripcion: formData.descripcion,
    // PROMO: fechaFin solo si la proporcionó; si no es promo, va null
    fechaFin: formData.categoria === PROMO_CATEGORY_ID ? (formData.fechaFin || null) : null,
    // PROMO no usa intervalos
    intervaloDias: formData.categoria === PROMO_CATEGORY_ID ? null : dias,
    tipo_intervalo: tipoIntervalo,
    fk_id_categoria_notificacion: Number(formData.categoria || 0),   
    enviarEmail: formData.enviarEmail,
    asuntoEmail: formData.asuntoEmail,
    cuerpoEmail: formData.cuerpoEmail,
    fk_id_tipo_notificacion: 1,
    fk_id_modulo_notificacion: Number(formData.modulo || 0),
    fk_id_estado_notificacion: reactivateIntent ? 1 : 1, // si reactivas al guardar → 1 
    fk_id_expediente: null,
    fk_id_orden: null,
    // PROMO → fecha_objetivo = fechaInicioProm, si no es promo queda null
    fecha_objetivo: formData.categoria === PROMO_CATEGORY_ID ? (formData.fechaInicioProm || null) : null,
  };

    setPendingPayload(payload); // guardar datos temporales
    setIsConfirmModalOpen(true); // abrir modal
  };

  // Ejecutar realmente guardar
  const confirmSave = async () => {
    try {
      if (mode === "edit" && id) {
        await updateNotificacion(id, pendingPayload);
        navigate("/notificaciones", {
          state: { successMessage: "✅ Notificación actualizada con éxito" }
        });
      } else {
        await createNotificacion(pendingPayload);
        navigate("/notificaciones", {
          state: { successMessage: "✅ Notificación creada con éxito" }
        });
      }
    } catch (error) {
      console.error("Error al guardar notificación:", error);
      alert("❌ Ocurrió un error al guardar la notificación");
    } finally {
      setIsConfirmModalOpen(false);
      setPendingPayload(null);
    }
  };

  // Es promoción si la categoría seleccionada es "2"
  const isPromocion = formData.categoria === PROMO_CATEGORY_ID;

  // Si es PROMO → limpiar intervalos (no se usan)
  useEffect(() => {
    if (isPromocion) {
      setFormData((p) => ({
        ...p,
        intervaloCantidad: 1,
        intervaloUnidad: "dias",
        tipoIntervalo: "", // no enviar nada
      }));
    }
  }, [isPromocion]);

  // Si cambia el módulo y NO es promoción, encarrilar tipoIntervalo
  useEffect(() => {
    if (isPromocion) return;

    if (formData.modulo === "1") {
      // Expedientes → siempre 'despues_registro'
      setFormData((p) => ({ ...p, tipoIntervalo: "despues_registro" }));
    } else if (formData.modulo === "2") {
      // Órdenes → si está vacío, proponemos 'antes_entrega'
      setFormData((p) => ({
        ...p,
        tipoIntervalo: p.tipoIntervalo || "antes_entrega",
      }));
    }
  }, [formData.modulo]);

  return (
    <div className="notificaciones-container">
      <h2>{mode === "edit" ? "Editar Notificación" : "Crear Nueva Notificación"}</h2>

      {location.state?.reactivateIntent && (
        <div className="success-banner" style={{ marginBottom: 12 }}>
          Revise la configuración y presione <b>Guardar</b> para <b>reactivar</b> esta notificación.
          Si presiona <b>Cancelar</b>, el estado de la notificacion no cambiará.
        </div>
      )}

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>

      <form className="notificaciones-form" onSubmit={handleSubmit}>
        {/* ID (solo en edición) */}
        {mode === "edit" && (
          <div className="form-row">
            <label>ID:</label>
            <input type="text" value={id} disabled />
          </div>
        )}

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

        {/* Categoría (IDs como values) */}
        <div className="form-row">
          <label>Categoría:</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          >
            <option value="">Seleccione categoría...</option>
            <option value="1">Recordatorio</option>
            <option value="2">Promoción</option>
          </select>
          {errors.categoria && <span className="error">{errors.categoria}</span>}
        </div>

        {formData.categoria === "2" && (
           <>
             <div className="form-row">
               <label>Fecha inicio (Promoción):</label>
               <input
                 type="date"
                 name="fechaInicioProm"
                 value={formData.fechaInicioProm || ""}
                 onChange={handleChange}
               />
               {errors.fechaInicioProm && <span className="error">{errors.fechaInicioProm}</span>}
             </div>
             {formData.fechaInicioProm && (
               <div className="form-row">
                 <label>Fecha fin:</label>
                 <input
                   type="date"
                   name="fechaFin"
                   value={formData.fechaFin || ""}
                   onChange={handleChange}
                 />
               </div>
             )}
           </>
         )}

        {/* Módulo (IDs como values) */}
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
            <option value="1">Expedientes</option>
            <option value="2">Órdenes</option>
          </select>
          {errors.modulo && <span className="error">{errors.modulo}</span>}
        </div>

        {/* Tipo de intervalo */}
        {formData.categoria !== "2" && (
          <div className="form-row">
            <label>¿Cuándo se enviará?</label>
            {formData.modulo === "1" && (
              <p className="static-label">X días después de la fecha de registro</p>
            )}
            {formData.modulo === "2" && (
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
        )}

        {/* Intervalo */}
        {formData.categoria !== "2" && (
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
        )}

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
          {mode === "edit" ? "Guardar Cambios" : "Guardar Notificación"}
        </button>
        <button
          type="button"
          className="btn-cerrar"
          onClick={() => navigate("/notificaciones")}
        >
          Cancelar
        </button>
      </form>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title={mode === "edit" ? "Confirmar actualización" : "Confirmar creación"}
        message={
          mode === "edit"
            ? "¿Deseas guardar los cambios de esta notificación?"
            : "¿Deseas crear esta nueva notificación?"
        }
        onConfirm={confirmSave}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
      </>
      )}
    </div>
  );
};

export default NotificacionForm;
