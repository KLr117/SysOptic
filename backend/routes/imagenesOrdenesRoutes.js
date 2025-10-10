import express from "express";
import {
  ImagenesOrdenesController,
  upload,
} from "../controllers/imagenesOrdenesController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

// Subir imagen
router.post(
  "/subir",
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
  authorizeModules("control_ordenes"),
  ImagenesOrdenesController.servirImagen
);

// Eliminar imagen (debe ir al final para evitar conflictos)
router.delete(
  "/:imagenId",
  authorizeModules("control_ordenes"),
  ImagenesOrdenesController.eliminarImagen
);

export default router;
