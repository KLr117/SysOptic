import express from "express";
import {
  ImagenesOrdenesController,
  upload, setOrdenIdMiddleware
} from "../controllers/imagenesOrdenesController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

// ✅ Capturar orden_id antes de multer
// Subir imagen
router.post(
  "/subir",
  setOrdenIdMiddleware,
  authorizeModules("control_ordenes"),
  upload.single("imagen"),
  ImagenesOrdenesController.subirImagen
);

// Obtener imágenes de una orden específica
router.get(
  "/orden/:ordenId",
  authorizeModules("control_ordenes"),
  ImagenesOrdenesController.obtenerImagenesPorOrden
);

// Obtener todas las imágenes
router.get(
  "/todas",
  authorizeModules("control_ordenes"),
  ImagenesOrdenesController.obtenerTodasLasImagenes
);

// Contar imágenes por orden
router.get(
  "/contar/:ordenId",
  authorizeModules("control_ordenes"),
  ImagenesOrdenesController.contarImagenesPorOrden
);

// Servir imagen por ID
router.get(
  "/servir/:imagenId",
  ImagenesOrdenesController.servirImagen
);

// Eliminar imagen (debe ir al final para evitar conflictos)
router.delete(
  "/:imagenId",
  setOrdenIdMiddleware,
  authorizeModules("control_ordenes"),
  ImagenesOrdenesController.eliminarImagen
);

export default router;
