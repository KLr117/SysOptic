import express from "express";
import {
  createNotificacion,
  getNotificaciones,
  getNotificacionById,
  updateNotificacion,
  deleteNotificacion
} from "../controllers/notificacionesController.js";

const router = express.Router();

router.post("/", createNotificacion);
router.get("/", getNotificaciones);
router.get("/:id", getNotificacionById);
router.put("/:id", updateNotificacion);
router.delete("/:id", deleteNotificacion);

export default router;
// Rutas de Notificaciones