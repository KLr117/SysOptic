import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  createNotificacion,
  getNotificacionById,
  updateNotificacion,
  createNotificacionExpediente,
  createNotificacionOrden,
  updateNotificacionEspecifica,
  getNotificacionEspecificaById,
} from '../services/notificacionesService';
import '../styles/vista-notificaciones.css';
import '../styles/form-errors.css';
import ConfirmModal from '../components/ConfirmModal';

// ID real de la categoría Promoción en tu catálogo (tu select ya usa "2")
const PROMO_CATEGORY_ID = '2';

// Normaliza string/Date a "YYYY-MM-DD" para <input type="date">
const toInputDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
};

const NotificacionForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isSpecific =
    mode === 'createExpediente' || mode === 'createOrden' || mode === 'editEspecifica';

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    intervaloCantidad: 1,
    intervaloUnidad: 'dias',
    tipoIntervalo: '',
    categoria: '',
    fechaFin: '',
    fechaInicioProm: '',
    enviarEmail: false,
    asuntoEmail: '',
    cuerpoEmail: '',
    modulo: '',
    tipo: 'General',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [correosEnviados, setCorreosEnviados] = useState(false);
  const [categoriaOriginal, setCategoriaOriginal] = useState('');
  const [showCambiarCategoriaModal, setShowCambiarCategoriaModal] = useState(false);
  const [pendingCategoriaChange, setPendingCategoriaChange] = useState(null);
  const [fechaInicioOriginal, setFechaInicioOriginal] = useState('');
  const [showCambiarFechaModal, setShowCambiarFechaModal] = useState(false);
  const [pendingFechaInicioChange, setPendingFechaInicioChange] = useState(null);
  const [moduloOriginal, setModuloOriginal] = useState('');
  const [showCambiarConfigModal, setShowCambiarConfigModal] = useState(false);
  const [pendingConfigChange, setPendingConfigChange] = useState(null);


  // ✅ Cargar datos según modo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (mode === 'editEspecifica' && id) {
          const res = await getNotificacionEspecificaById(id);
          if (res && res.pk_id_notificacion) {
            setFormData({
              titulo: res.titulo || '',
              descripcion: res.descripcion || '',
              intervaloCantidad: res.intervalo_dias || 1,
              intervaloUnidad: 'dias',
              tipoIntervalo: res.tipo_intervalo || '',
              categoria: res.fk_id_categoria_notificacion?.toString() || '',
              fechaFin: toInputDate(res.fecha_fin),
              fechaInicioProm: toInputDate(res.fecha_objetivo),
              enviarEmail: res.enviar_email === 1,
              asuntoEmail: res.asunto_email || '',
              cuerpoEmail: res.cuerpo_email || '',
              modulo: res.fk_id_modulo_notificacion?.toString() || '',
              tipo: 'Recordatorio',
            });
            // Detectar si hay correos enviados
            setCorreosEnviados(res.correos_enviados > 0 || res.envios_registrados > 0);
            setCategoriaOriginal(res.fk_id_categoria_notificacion?.toString() || '');
            setModuloOriginal(res.fk_id_modulo_notificacion?.toString() || '');
            setFechaInicioOriginal(toInputDate(res.fecha_objetivo) || '');
          } else {
            console.warn('Respuesta inesperada de la API:', res);
          }
        } else if (mode === 'edit' && id) {
          const data = await getNotificacionById(id);
          setFormData({
            titulo: data.titulo || '',
            descripcion: data.descripcion || '',
            intervaloCantidad: data.intervalo_dias || 1,
            intervaloUnidad: 'dias',
            tipoIntervalo: data.tipo_intervalo || '',
            categoria: data.fk_id_categoria_notificacion?.toString() || '',
            fechaFin: toInputDate(data.fecha_fin),
            fechaInicioProm: toInputDate(data.fecha_objetivo),
            enviarEmail: data.enviar_email === 1,
            asuntoEmail: data.asunto_email || '',
            cuerpoEmail: data.cuerpo_email || '',
            modulo: data.fk_id_modulo_notificacion?.toString() || '',
            tipo: data.nombre_tipo || 'General',
          });
          // Detectar si hay correos enviados
          setCorreosEnviados(data.correos_enviados > 0 || data.envios_registrados > 0);
          setCategoriaOriginal(data.fk_id_categoria_notificacion?.toString() || '');
          setModuloOriginal(data.fk_id_modulo_notificacion?.toString() || '');
          setFechaInicioOriginal(toInputDate(data.fecha_objetivo) || '');
        } else if (mode === 'createExpediente') {
          setFormData((prev) => ({
            ...prev,
            modulo: '1',
            categoria: '1',
            tipo: 'Recordatorio',
            tipoIntervalo: 'despues_registro',
          }));
        } else if (mode === 'createOrden') {
          setFormData((prev) => ({
            ...prev,
            modulo: '2',
            categoria: '1',
            tipo: 'Recordatorio',
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar notificación:', error);
        setLoading(false);
        if (error.response?.status === 401) {
          alert('No tienes permisos para ver esta notificación.');
          const origin = location.state?.from;
          if (mode.includes('Expediente') || origin === 'expedientes') navigate('/expedientes');
          else if (
            mode.includes('Orden') ||
            mode.includes('editEspecifica') ||
            origin === 'ordenes'
          )
            navigate('/ordenes');
          else navigate('/notificaciones');
        } else {
          alert('Error al cargar la notificación. Intenta nuevamente.');
        }
      }
    };

    if (mode === 'edit' || mode === 'editEspecifica') {
      fetchData();
    } else if (mode === 'createExpediente' || mode === 'createOrden') {
      if (mode === 'createExpediente') {
        setFormData((prev) => ({
          ...prev,
          modulo: '1',
          categoria: '1',
          tipo: 'Recordatorio',
          tipoIntervalo: 'despues_registro',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          modulo: '2',
          categoria: '1',
          tipo: 'Recordatorio',
        }));
      }
    }
  }, [mode, id]);

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  // solo activar validación si estamos editando una notificación existente (con id)
  const isEditing = (mode === 'edit' || mode === 'editEspecifica') && !!id;

    // 🟡 Validación especial para cambio de categoría si hay correos enviados
    if ((name === 'categoria' || name === 'modulo') && isEditing && correosEnviados) {
      const isModuleChange = name === 'modulo' && value !== moduloOriginal;
      const isCategoryChange = name === 'categoria' && value !== categoriaOriginal;

      if (isModuleChange || isCategoryChange) {
        setPendingConfigChange({
          field: name,
          value: value
        });
        setShowCambiarConfigModal(true);
        return;
      }
    }

    // 🟡 Validación especial para cambio de fecha de inicio si hay correos enviados
    if (
      name === 'fechaInicioProm' &&
      isEditing &&
      correosEnviados
    ) {
      if (value !== fechaInicioOriginal) {
        setPendingFechaInicioChange(value);
        setShowCambiarFechaModal(true);
        return; // No aplicar el cambio hasta confirmar
      }
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Confirmar cambio de categoría
  const confirmarCambiarCategoria = () => {
    setFormData({
      ...formData,
      categoria: pendingCategoriaChange,
    });
    setShowCambiarCategoriaModal(false);
    setPendingCategoriaChange(null);
  };

  // Cancelar cambio de categoría
  const cancelarCambiarCategoria = () => {
    setShowCambiarCategoriaModal(false);
    setPendingCategoriaChange(null);
  };

  const confirmarCambiarConfig = () => {
  setFormData(prev => ({
    ...prev,
    [pendingConfigChange.field]: pendingConfigChange.value,
    // Si cambia el módulo, resetear tipoIntervalo
    ...(pendingConfigChange.field === 'modulo' ? { tipoIntervalo: '' } : {})
    }));
    setShowCambiarConfigModal(false);
    setPendingConfigChange(null);
  };

  const cancelarCambiarConfig = () => {
    setShowCambiarConfigModal(false);
    setPendingConfigChange(null);
  };

  const confirmarCambiarFecha = () => {
    setFormData({
      ...formData,
      fechaInicioProm: pendingFechaInicioChange,
    });
    setShowCambiarFechaModal(false);
    setPendingFechaInicioChange(null);
  };

  const cancelarCambiarFecha = () => {
    setShowCambiarFechaModal(false);
    setPendingFechaInicioChange(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios básicos
    if (!formData.titulo.trim()) newErrors.titulo = 'Debe ingresar un título';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'Debe ingresar una descripción';

    // Categoría obligatoria siempre
    if (!formData.categoria) newErrors.categoria = 'Debe seleccionar una categoría';

    // Validaciones solo para notificaciones generales
    if (!isSpecific) {
      if (!formData.modulo) newErrors.modulo = 'Debe seleccionar un módulo';
      if (
        formData.categoria !== PROMO_CATEGORY_ID &&
        formData.modulo === '2' &&
        !formData.tipoIntervalo
      ) {
        newErrors.tipoIntervalo = 'Debe elegir cuándo se enviará';
      }
    }

    // Validaciones para notificaciones específicas de órdenes
    if (
      mode === 'createOrden' &&
      formData.categoria !== PROMO_CATEGORY_ID &&
      !formData.tipoIntervalo
    ) {
      newErrors.tipoIntervalo = 'Debe elegir cuándo se enviará';
    }

    // Validaciones para promociones (generales y específicas)
    if (formData.categoria === PROMO_CATEGORY_ID) {
      if (!formData.fechaInicioProm) {
        newErrors.fechaInicioProm = 'Debe seleccionar una fecha de inicio';
      }
      // Validar que fecha fin no sea anterior a fecha inicio
      if (formData.fechaInicioProm && formData.fechaFin) {
        const fechaInicio = new Date(formData.fechaInicioProm);
        const fechaFin = new Date(formData.fechaFin);
        if (fechaFin < fechaInicio) {
          newErrors.fechaFin = 'La fecha fin no puede ser anterior a la fecha de inicio';
        }
      }
    }

    // Validaciones de email si está activo
    if (formData.enviarEmail) {
      if (!formData.asuntoEmail || !formData.asuntoEmail.trim()) {
        newErrors.asuntoEmail = 'Debe ingresar un asunto para el correo';
      }
      if (!formData.cuerpoEmail || !formData.cuerpoEmail.trim()) {
        newErrors.cuerpoEmail = 'Debe ingresar el cuerpo del correo';
      }
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
    if (formData.intervaloUnidad === 'semanas') dias *= 7;
    if (formData.intervaloUnidad === 'meses') dias *= 30;
    if (formData.intervaloUnidad === 'anios') dias *= 365;

    // 2) tipo_intervalo válido
    let tipoIntervalo = formData.tipoIntervalo;
    if (formData.categoria !== PROMO_CATEGORY_ID) {
      if (formData.modulo === '1') tipoIntervalo = 'despues_registro';
      // en módulo "2" se respeta lo que eligió el usuario (y ya lo validaste)
    } else {
      tipoIntervalo = null; // PROMO no usa intervalos
    }

    // 3) ¿venimos con intención de reactivar?
    const reactivateIntent = !!location.state?.reactivateIntent;

    let payload;

    // Payload para notificaciones específicas
    if (isSpecific) {
      payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        intervalo_dias: formData.categoria === PROMO_CATEGORY_ID ? null : dias,
        tipo_intervalo: tipoIntervalo,
        enviar_email: formData.enviarEmail ? 1 : 0,
        asunto_email: formData.asuntoEmail,
        cuerpo_email: formData.cuerpoEmail,
        fk_id_categoria_notificacion: Number(formData.categoria || 1),
        fecha_objetivo:
          formData.categoria === PROMO_CATEGORY_ID ? formData.fechaInicioProm || null : null,
        fecha_fin: formData.categoria === PROMO_CATEGORY_ID ? formData.fechaFin || null : null,
      };
    } else {
      // Payload para notificaciones generales
      payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fechaFin: formData.categoria === PROMO_CATEGORY_ID ? formData.fechaFin || null : null,
        intervaloDias: formData.categoria === PROMO_CATEGORY_ID ? null : dias,
        tipo_intervalo: tipoIntervalo,
        fk_id_categoria_notificacion: Number(formData.categoria || 0),
        enviarEmail: formData.enviarEmail,
        asuntoEmail: formData.asuntoEmail,
        cuerpoEmail: formData.cuerpoEmail,
        fk_id_tipo_notificacion: 1,
        fk_id_modulo_notificacion: Number(formData.modulo || 0),
        fk_id_estado_notificacion: reactivateIntent ? 1 : 1,
        fk_id_expediente: null,
        fk_id_orden: null,
        fecha_objetivo:
          formData.categoria === PROMO_CATEGORY_ID ? formData.fechaInicioProm || null : null,
      };
    }

    setPendingPayload(payload);
    setIsConfirmModalOpen(true);
  };

  // Ejecutar realmente guardar
  const confirmSave = async () => {
    try {
      if (mode === 'createExpediente') {
        await createNotificacionExpediente(id, pendingPayload);
        navigate('/expedientes', {
          state: { successMessage: '✅ Notificación creada con éxito' },
        });
      } else if (mode === 'createOrden') {
        await createNotificacionOrden(id, pendingPayload);
        navigate('/ordenes', {
          state: { successMessage: '✅ Notificación creada con éxito' },
        });
      } else if (mode === 'editEspecifica' && id) {
        await updateNotificacionEspecifica(id, pendingPayload);
        const redirectPath = formData.modulo === '1' ? '/expedientes' : '/ordenes';
        navigate(redirectPath, {
          state: { successMessage: '✅ Notificación actualizada con éxito' },
        });
      } else if (mode === 'edit' && id) {
        await updateNotificacion(id, pendingPayload);
        navigate('/notificaciones', {
          state: { successMessage: '✅ Notificación actualizada con éxito' },
        });
      } else {
        await createNotificacion(pendingPayload);
        navigate('/notificaciones', {
          state: { successMessage: '✅ Notificación creada con éxito' },
        });
      }
    } catch (error) {
      console.error('Error al guardar notificación:', error);
      alert('❌ Ocurrió un error al guardar la notificación');
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
        intervaloUnidad: 'dias',
        tipoIntervalo: '', // no enviar nada
      }));
    }
  }, [isPromocion]);

  // Si cambia el módulo y NO es promoción, encarrilar tipoIntervalo
  useEffect(() => {
    if (isPromocion) return;

    if (formData.modulo === '1') {
      // Expedientes → siempre 'despues_registro'
      setFormData((p) => ({ ...p, tipoIntervalo: 'despues_registro' }));
    } else if (formData.modulo === '2') {
      // Órdenes → si está vacío, proponemos 'antes_entrega'
      setFormData((p) => ({
        ...p,
        tipoIntervalo: p.tipoIntervalo || 'antes_entrega',
      }));
    }
  }, [formData.modulo]);

  const getFormTitle = () => {
    if (mode === 'createExpediente') return '🔔 Crear Notificación para Expediente Específico';
    if (mode === 'createOrden') return '🔔 Crear Notificación para Orden Específica';
    if (mode === 'editEspecifica') return '✏️ Editar Notificación Específica';
    if (mode === 'edit') return '✏️ Editar Notificación';
    return '🔔 Crear Nueva Notificación General';
  };

  const handleCancel = () => {
    const origin = location.state?.from;
    if (mode.includes('Expediente') || origin === 'expedientes') navigate('/expedientes');
    else if (mode.includes('Orden') || mode.includes('editEspecifica') || origin === 'ordenes')
      navigate('/ordenes');
    else navigate('/notificaciones');
  };

  return (
    <div className="notificaciones-container">
      <div className="form-header">
        <h2>{getFormTitle()}</h2>
      </div>

      {location.state?.reactivateIntent && (
        <div className="success-banner" style={{ marginBottom: 12 }}>
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div>
              <strong>Reactivación de Notificación</strong>
              <p>
                Revise la configuración y presione <b>Guardar</b> para <b>reactivar</b> esta
                notificación. Si presiona <b>Cancelar</b>, el estado de la notificacion no cambiará.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      ) : (
        <>
          <form className="notificaciones-form" onSubmit={handleSubmit}>
            {/* Sección: Información Básica */}
            <div className="form-section">
              <div className="section-header">
                <h3>📝 Información Básica</h3>
                <p>Datos principales de la notificación</p>
              </div>

              <div className="form-grid">
                {/* ID (solo en edición) */}
                {(mode === 'edit' || mode === 'editEspecifica') && (
                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">🆔</span>
                      ID de Notificación
                    </label>
                    <input type="text" value={id} disabled className="field-input disabled" />
                  </div>
                )}

                {/* Título */}
                <div className="form-field">
                  <label className="field-label">
                    <span className="label-icon">📌</span>
                    Título *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="Ingrese el título de la notificación"
                  />
                  {errors.titulo && <span className="error-message">{errors.titulo}</span>}
                </div>

                {/* Descripción */}
                <div className="form-field full-width">
                  <label className="field-label">
                    <span className="label-icon">📄</span>
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="field-textarea"
                    placeholder="Describa el propósito de esta notificación"
                    rows="3"
                  />
                  {errors.descripcion && (
                    <span className="error-message">{errors.descripcion}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Configuración de Categoría y Módulo */}
            {!isSpecific && (
              <div className="form-section">
                <div className="section-header">
                  <h3>⚙️ Configuración</h3>
                  <p>Define el tipo y alcance de la notificación</p>
                </div>

                <div className="form-grid">
                  {/* Categoría */}
                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">🏷️</span>
                      Categoría *
                    </label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="field-select"
                    >
                      <option value="">Seleccione categoría...</option>
                      <option value="1">📅 Recordatorio</option>
                      <option value="2">🎯 Promoción</option>
                    </select>
                    {errors.categoria && <span className="error-message">{errors.categoria}</span>}
                  </div>

                  {/* Módulo */}
                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">📦</span>
                      Módulo *
                    </label>
                    <select
                      name="modulo"
                      value={formData.modulo}
                      onChange={(e) => {
                        const value = e.target.value;
                        const isEditing = (mode === 'edit' || mode === 'editEspecifica') && !!id;

                        // Validación para correos enviados (solo si estamos editando esa notificación y ya hubo envíos)
                        if (isEditing && correosEnviados && value !== moduloOriginal) {
                          setPendingConfigChange({
                            field: 'modulo',
                            value: value
                          });
                          setShowCambiarConfigModal(true);
                          return;
                        }

                        // Si no hay correos enviados o se confirmó el cambio, actualizar normalmente
                        setFormData({
                          ...formData,
                          modulo: value,
                          tipoIntervalo: '',
                        });
                      }}
                      className="field-select"
                    >
                      <option value="">Seleccione módulo...</option>
                      <option value="1">📁 Expedientes</option>
                      <option value="2">📋 Órdenes</option>
                    </select>
                    {errors.modulo && <span className="error-message">{errors.modulo}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Información estática para notificaciones específicas */}
            {isSpecific && (
              <div className="form-section">
                <div className="section-header">
                  <h3>ℹ️ Información de Notificación</h3>
                  <p>Esta es una notificación específica</p>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">🏷️</span>
                      Categoría *
                    </label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="field-select"
                    >
                      <option value="">Seleccione categoría...</option>
                      <option value="1">📅 Recordatorio</option>
                      <option value="2">🎯 Promoción</option>
                    </select>
                    {errors.categoria && <span className="error-message">{errors.categoria}</span>}
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">📦</span>
                      Módulo
                    </label>
                    <input
                      type="text"
                      value={formData.modulo === '1' ? '📁 Expedientes' : '📋 Órdenes'}
                      disabled
                      className="field-input disabled"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Fechas de Promoción (solo si es promoción) */}
            {formData.categoria === '2' && (
              <div className="form-section">
                <div className="section-header">
                  <h3>📅 Fechas de Promoción</h3>
                  <p>Configure el período de vigencia de la promoción</p>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">🚀</span>
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      name="fechaInicioProm"
                      value={formData.fechaInicioProm || ''}
                      onChange={handleChange}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}  // ✅ abre calendario al hacer clic
                      onFocus={(e) => e.target.showPicker && e.target.showPicker()}  // ✅ abre también al enfocar con tab
                      className="field-input"
                    />
                    {errors.fechaInicioProm && (
                      <span className="error-message">{errors.fechaInicioProm}</span>
                    )}
                  </div>

                  {formData.fechaInicioProm && (
                    <div className="form-field">
                      <label className="field-label">
                        <span className="label-icon">🏁</span>
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        name="fechaFin"
                        value={formData.fechaFin || ''}
                        onChange={handleChange}
                        min={formData.fechaInicioProm}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}  // ✅ abre calendario al hacer clic
                        onFocus={(e) => e.target.showPicker && e.target.showPicker()}  // ✅ abre también al enfocar con tab
                        className="field-input"
                      />
                      {errors.fechaFin && <span className="error-message">{errors.fechaFin}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Configuración de Tiempo (solo si NO es promoción) */}
            {formData.categoria !== '2' && (
              <div className="form-section">
                <div className="section-header">
                  <h3>⏰ Configuración de Tiempo</h3>
                  <p>Define cuándo y cómo se enviará la notificación</p>
                </div>

                <div className="form-grid">
                  {/* Tipo de intervalo */}
                  <div className="form-field full-width">
                    <label className="field-label">
                      <span className="label-icon">❓</span>
                      ¿Cuándo se enviará?
                    </label>
                    {formData.modulo === '1' && (
                      <div className="static-option">
                        <div className="option-card">
                          <span className="option-icon">📅</span>
                          <span className="option-text">
                            X días después de la fecha de registro
                          </span>
                        </div>
                      </div>
                    )}
                    {formData.modulo === '2' && (
                      <select
                        name="tipoIntervalo"
                        value={formData.tipoIntervalo}
                        onChange={handleChange}
                        className="field-select"
                      >
                        <option value="">Seleccione opción...</option>
                        <option value="antes_entrega">
                          ⏰ X días antes de la fecha de entrega
                        </option>
                        <option value="despues_recepcion">
                          📥 X días después de la fecha de recepción
                        </option>
                      </select>
                    )}
                    {errors.tipoIntervalo && (
                      <span className="error-message">{errors.tipoIntervalo}</span>
                    )}
                  </div>

                  {/* Intervalo */}
                  <div className="form-field">
                    <label className="field-label">
                      <span className="label-icon">🔢</span>
                      Intervalo
                    </label>
                    <div className="intervalo-container">
                      <input
                        type="number"
                        name="intervaloCantidad"
                        value={formData.intervaloCantidad}
                        onChange={handleChange}
                        min="0"
                        className="field-input intervalo-number"
                        placeholder="0"
                      />
                      <select
                        name="intervaloUnidad"
                        value={formData.intervaloUnidad}
                        onChange={handleChange}
                        className="field-select intervalo-unit"
                      >
                        <option value="dias">Días</option>
                        <option value="semanas">Semanas</option>
                        <option value="meses">Meses</option>
                        <option value="anios">Años</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Configuración de Email */}
            <div className="form-section">
              <div className="section-header">
                <h3>📧 Configuración de Email</h3>
                <p>Configure el envío de correos electrónicos</p>
              </div>

              <div className="form-grid">
                <div className="form-field full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enviarEmail"
                      checked={formData.enviarEmail}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      <span className="label-icon">📧</span>
                      ¿Enviar correo al cliente?
                    </span>
                  </label>
                </div>

                {formData.enviarEmail && (
                  <>
                    <div className="form-field">
                      <label className="field-label">
                        <span className="label-icon">📨</span>
                        Asunto del Correo *
                      </label>
                      <input
                        type="text"
                        name="asuntoEmail"
                        value={formData.asuntoEmail}
                        onChange={handleChange}
                        className="field-input"
                        placeholder="Asunto del correo electrónico"
                      />
                      {errors.asuntoEmail && (
                        <span className="error-message">{errors.asuntoEmail}</span>
                      )}
                    </div>

                    <div className="form-field full-width">
                      <label className="field-label">
                        <span className="label-icon">📝</span>
                        Cuerpo del Correo *
                      </label>
                      <textarea
                        name="cuerpoEmail"
                        value={formData.cuerpoEmail}
                        onChange={handleChange}
                        className="field-textarea"
                        placeholder="Contenido del correo electrónico"
                        rows="4"
                      />
                      {errors.cuerpoEmail && (
                        <span className="error-message">{errors.cuerpoEmail}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <span className="btn-icon">💾</span>
                {mode === 'edit' ? 'Guardar Cambios' : 'Crear Notificación'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                <span className="btn-icon">❌</span>
                Cancelar
              </button>
            </div>
          </form>

          <ConfirmModal
            isOpen={isConfirmModalOpen}
            title={mode === 'edit' ? 'Confirmar actualización' : 'Confirmar creación'}
            message={
              mode === 'edit'
                ? '¿Deseas guardar los cambios de esta notificación?'
                : '¿Deseas crear esta nueva notificación?'
            }
            onConfirm={confirmSave}
            onCancel={() => setIsConfirmModalOpen(false)}
          />

          {/* Modal de advertencia de cambio de categoría */}
          <ConfirmModal
            isOpen={showCambiarCategoriaModal}
            title="⚠️ Advertencia: Cambio de Categoría"
            message={
              <>
                <p>
                  Ya fue enviado al menos un correo con esta configuración.
                  <br />
                  <strong>¿Está seguro que desea cambiar la categoría de esta notificación?</strong>
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  Si la cambia, no se enviará un nuevo correo a quienes ya lo recibieron.
                  <br />
                  Si desea reenviar una notificación, elimínela y cree una nueva con la configuracion deseada.
                </p>
              </>
            }
            onConfirm={confirmarCambiarCategoria}
            onCancel={cancelarCambiarCategoria}
          />
          {/* Fin Modal de advertencia de cambio de categoría */}

          {/* Modal de advertencia de cambio de fecha de inicio */}
          <ConfirmModal
            isOpen={showCambiarFechaModal}
            title="⚠️ Advertencia: Cambio de Fecha de Inicio"
            message={
              <>
                <p>
                  Ya fue enviado un correo basado en esta configuración de fecha de inicio.
                  <br />
                  <br />
                  <strong>¿Está seguro que desea cambiar la fecha de inicio de esta notificación?</strong>
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  Si la cambia, no se reenviará un nuevo correo automáticamente a los registros que ya recibieron uno bajo esta configuración.
                  <br />   
                  Si necesita enviar un nuevo correo, elimine esta notificación y cree una nueva.
                </p>
              </>
            }
            onConfirm={confirmarCambiarFecha}
            onCancel={cancelarCambiarFecha}
          />
          {/* Fin Modal de advertencia de cambio de categoría */}

          {/* Modal de advertencia de cambio de configuración */}
          <ConfirmModal
            isOpen={showCambiarConfigModal}
            title="⚠️ Advertencia: Cambio de Configuración"
            message={
              <>
                <p>
                  Ya fue enviado al menos un correo con esta configuración.
                  <br />
                  <strong>
                    ¿Está seguro que desea cambiar {
                      pendingConfigChange?.field === 'modulo' ? 'módulo' : 'categoría'
                    } de esta notificación?
                  </strong>
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  Si realiza el cambio, no se enviará un nuevo correo a los registros que ya recibieron uno bajo la configuración anterior.
                  <br />
                  Si necesita reenviar notificaciones, le sugerimos crear una nueva notificación con la configuración deseada.
                </p>
              </>
            }
            onConfirm={confirmarCambiarConfig}
            onCancel={cancelarCambiarConfig}
          />
          {/* Fin Modal de advertencia de cambio de configuración */}
        </>
      )}
    </div>
  );
};

export default NotificacionForm;
