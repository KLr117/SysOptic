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

export default router;
