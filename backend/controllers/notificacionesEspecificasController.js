import * as model from "../models/notificacionesEspecificasModel.js";

// 📩 CREAR — EXPEDIENTE
export const crearNotificacionEspecificaExpediente = async (req, res) => {
  try {
    await model.crearNotificacionExpediente({
      expedienteId: req.params.expedienteId,
      ...req.body,
    });
    res.json({ ok: true, message: "Notificación específica creada correctamente" });
  } catch (error) {
    console.error("Error creando notificación específica:", error);
    res.status(500).json({ ok: false, message: "Error al crear notificación específica" });
  }
};

// 📩 CREAR — ORDEN
export const crearNotificacionEspecificaOrden = async (req, res) => {
  try {
    await model.crearNotificacionOrden({
      ordenId: req.params.ordenId,
      ...req.body,
    });
    res.json({ ok: true, message: "Notificación específica creada correctamente" });
  } catch (error) {
    console.error("Error creando notificación específica:", error);
    res.status(500).json({ ok: false, message: "Error al crear notificación específica" });
  }
};

// 📋 OBTENER
export const obtenerNotificacionPorExpediente = async (req, res) => {
  try {
    const notificacion = await model.obtenerPorExpediente(req.params.expedienteId);
    res.json({ ok: true, notificacion });
  } catch (error) {
    console.error("Error obteniendo notificación específica:", error);
    res.status(500).json({ ok: false, message: "Error al obtener notificación específica" });
  }
};

export const obtenerNotificacionPorOrden = async (req, res) => {
  try {
    const notificacion = await model.obtenerPorOrden(req.params.ordenId);
    res.json({ ok: true, notificacion });
  } catch (error) {
    console.error("Error obteniendo notificación específica:", error);
    res.status(500).json({ ok: false, message: "Error al obtener notificación específica" });
  }
};

export const obtenerNotificacionEspecificaPorId = async (req, res) => {
  try {
    const notificacion = await model.obtenerPorId(req.params.id);
    if (!notificacion)
      return res.status(404).json({ ok: false, message: "Notificación no encontrada" });
    res.json(notificacion);
  } catch (error) {
    console.error("Error obteniendo notificación específica por ID:", error);
    res.status(500).json({ ok: false, message: "Error al obtener notificación específica" });
  }
};

// ✏️ EDITAR
export const editarNotificacionEspecifica = async (req, res) => {
  try {
    await model.editarNotificacion(req.params.id, req.body);
    res.json({ ok: true, message: "Notificación específica actualizada correctamente" });
  } catch (error) {
    console.error("Error actualizando notificación específica:", error);
    res.status(500).json({ ok: false, message: "Error al actualizar notificación" });
  }
};

// 🗑️ ELIMINAR
export const eliminarNotificacionEspecifica = async (req, res) => {
  try {
    await model.eliminarNotificacion(req.params.id);
    res.json({ ok: true, message: "Notificación específica eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando notificación específica:", error);
    res.status(500).json({ ok: false, message: "Error al eliminar notificación" });
  }
};

// ✅ ESTADO
export const obtenerEstadoNotificacionExpediente = async (req, res) => {
  try {
    const data = await model.obtenerEstadoPorExpediente(req.params.expedienteId);
    if (!data)
      return res.json({ ok: true, tieneNotificacion: false, estado: null });
    const estado = data.estado_id === 1 ? "activa" : "inactiva";
    res.json({
      ok: true,
      tieneNotificacion: true,
      estado,
      id: data.id,
      titulo: data.titulo,
    });
  } catch (error) {
    console.error("Error obteniendo estado de notificación:", error);
    res.status(500).json({ ok: false, message: "Error al obtener estado de notificación" });
  }
};

export const obtenerEstadoNotificacionOrden = async (req, res) => {
  try {
    const data = await model.obtenerEstadoPorOrden(req.params.ordenId);
    if (!data)
      return res.json({ ok: true, tieneNotificacion: false, estado: null });
    const estado = data.estado_id === 1 ? "activa" : "inactiva";
    res.json({
      ok: true,
      tieneNotificacion: true,
      estado,
      id: data.id,
      titulo: data.titulo,
    });
  } catch (error) {
    console.error("Error obteniendo estado de notificación:", error);
    res.status(500).json({ ok: false, message: "Error al obtener estado de notificación" });
  }
};

