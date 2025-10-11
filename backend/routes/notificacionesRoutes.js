import express from "express";
import {
  createNotificacion,
  getNotificaciones,
  getNotificacionById,
  updateNotificacion,
  deleteNotificacion,
  cambiarEstadoNotificacion,
  procesarPromocionesActivas,
  procesarRecordatoriosActivos,
} from "../controllers/notificacionesController.js";
import {
  crearNotificacionEspecificaExpediente,
  crearNotificacionEspecificaOrden,
  obtenerNotificacionPorExpediente,
  obtenerNotificacionPorOrden,
  obtenerNotificacionEspecificaPorId,
  editarNotificacionEspecifica,
  eliminarNotificacionEspecifica,
  obtenerEstadoNotificacionExpediente,
  obtenerEstadoNotificacionOrden,
} from "../controllers/notificacionesEspecificasController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

router.post(
  "/",
  authorizeModules("control_notificaciones"),
  createNotificacion
);
router.get("/", authorizeModules("control_notificaciones"), getNotificaciones);
router.get(
  "/:id",
  authorizeModules("control_notificaciones"),
  getNotificacionById
);
router.put(
  "/:id",
  authorizeModules("control_notificaciones"),
  updateNotificacion
);
router.delete(
  "/:id",
  authorizeModules("control_notificaciones"),
  deleteNotificacion
);
router.put(
  "/estado/:id",
  authorizeModules("control_notificaciones"),
  cambiarEstadoNotificacion
);
router.post(
  "/procesar-promociones",
  authorizeModules("control_notificaciones"),
  procesarPromocionesActivas
);
router.post(
  "/procesar-recordatorios",
  authorizeModules("control_notificaciones"),
  procesarRecordatoriosActivos
);

// ===========================
// 📦 NOTIFICACIONES ESPECÍFICAS
// ===========================

// Crear notificación específica para expediente
router.post(
  "/especifica/expediente/:expedienteId",
  authorizeModules("control_expedientes"),
  crearNotificacionEspecificaExpediente
);

// Crear notificación específica para orden
router.post(
  "/especifica/orden/:ordenId",
  authorizeModules("control_ordenes"),
  crearNotificacionEspecificaOrden
);

// Obtener notificación específica de expediente
router.get(
  "/especifica/expediente/:expedienteId",
  authorizeModules("control_expedientes"),
  obtenerNotificacionPorExpediente
);

// Obtener notificación específica de orden
router.get(
  "/especifica/orden/:ordenId",
  authorizeModules("control_ordenes"),
  obtenerNotificacionPorOrden
);

// Obtener notificación específica por ID (para ver/editar)
router.get(
  "/especifica/:id",
  authorizeModules("control_admin", "control_expedientes", "control_ordenes"),
  obtenerNotificacionEspecificaPorId
);

// Editar notificación específica
router.put(
  "/especifica/:id",
  authorizeModules("control_admin", "control_expedientes", "control_ordenes"),
  editarNotificacionEspecifica
);

// Eliminar notificación específica
router.delete(
  "/especifica/:id",
  authorizeModules("control_admin", "control_expedientes", "control_ordenes"),
  eliminarNotificacionEspecifica
);

// ✅ ENDPOINT OPTIMIZADO DE ESTADO
router.get(
  "/estado/expediente/:expedienteId",
  authorizeModules("control_expedientes"),
  obtenerEstadoNotificacionExpediente
);

router.get(
  "/estado/orden/:ordenId",
  authorizeModules("control_ordenes"),
  obtenerEstadoNotificacionOrden
);

export default router;
