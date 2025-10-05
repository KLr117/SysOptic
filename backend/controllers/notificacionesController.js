import * as notificacionesModel from "../models/notificacionesModel.js";
import { updateEstadoNotificacion } from "../models/notificacionesModel.js";

// 🔍 Validación con soporte a Promoción
const validarTipoIntervaloPorModulo = (moduloId, tipoIntervalo, categoriaId) => {
  // Si es categoría Promoción → no requiere tipo_intervalo
  if (categoriaId === 2) {
    return true;
  }

  // Si no es promoción → validar como antes
  if (moduloId === 1) {
    return tipoIntervalo === "despues_registro";
  }
  if (moduloId === 2) {
    return tipoIntervalo === "antes_entrega" || tipoIntervalo === "despues_recepcion";
  }
  return false;
};

// Crear
export const createNotificacion = async (req, res) => {
  try {
    const {
      fk_id_modulo_notificacion,
      tipo_intervalo
    } = req.body;

    if (!validarTipoIntervaloPorModulo(fk_id_modulo_notificacion, tipo_intervalo,  req.body.fk_id_categoria_notificacion)) {
      return res.status(400).json({
        error: "tipo_intervalo inválido para el módulo seleccionado"
      });
    }

    const id = await notificacionesModel.createNotificacion(req.body);
    res.status(201).json({ message: "Notificación creada", id });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({ error: "Error al crear notificación" });
  }
};

// Listar todas
export const getNotificaciones = async (req, res) => {
  try {
    const rows = await notificacionesModel.getNotificaciones();
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

// Obtener por ID
export const getNotificacionById = async (req, res) => {
  try {
    const row = await notificacionesModel.getNotificacionById(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json(row);
  } catch (error) {
    console.error("Error al obtener notificación:", error);
    res.status(500).json({ error: "Error al obtener notificación" });
  }
};

// Actualizar
export const updateNotificacion = async (req, res) => {
  try {
    const {
      fk_id_modulo_notificacion,
      tipo_intervalo
    } = req.body;

    if (!validarTipoIntervaloPorModulo(fk_id_modulo_notificacion, tipo_intervalo,  req.body.fk_id_categoria_notificacion)) {
      return res.status(400).json({
        error: "tipo_intervalo inválido para el módulo seleccionado"
      });
    }

    const affected = await notificacionesModel.updateNotificacion(Number(req.params.id), req.body);
    if (affected === 0) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ message: "Notificación actualizada" });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

// Eliminar
export const deleteNotificacion = async (req, res) => {
  try {
    const affected = await notificacionesModel.deleteNotificacion(Number(req.params.id));
    if (affected === 0) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
};

// 🟢 Controlador para actualizar el estado
export const cambiarEstadoNotificacion = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstadoId } = req.body;

  try {
    if (!id || !nuevoEstadoId) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros: id o nuevoEstadoId."
      });
    }

    const result = await updateEstadoNotificacion(id, nuevoEstadoId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el estado de la notificación.",
      error: error.message
    });
  }
};

// Controlador de Notificaciones