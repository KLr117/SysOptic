import express from "express";
import {
  ImagenesExpedientesController,
  upload,
} from "../controllers/imagenesExpedientesController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

// 🔹 SUBIR IMAGEN A EXPEDIENTE
router.post(
  "/subir",
  authorizeModules("control_expedientes"),
  upload.single("imagen"),
  ImagenesExpedientesController.subirImagen
);

// 🔹 OBTENER IMÁGENES DE UN EXPEDIENTE ESPECÍFICO
router.get(
  "/expediente/:expedienteId",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.obtenerImagenesPorExpediente
);

// 🔹 OBTENER TODAS LAS IMÁGENES
router.get(
  "/todas",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.obtenerTodasLasImagenes
);

// 🔹 CONTAR IMÁGENES POR EXPEDIENTE
router.get(
  "/contar/:expedienteId",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.contarImagenesPorExpediente
);

// 🔹 SERVIR IMAGEN POR ID
router.get(
  "/servir/:imagenId",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.servirImagen
);

// 🔹 SERVIR IMAGEN POR RUTA (para rutas codificadas)
router.get(
  "/servir-ruta/*",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.servirImagenPorRuta
);

// 🔹 OBTENER IMAGEN POR ID (información)
router.get(
  "/:imagenId",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.obtenerImagenPorId
);

// 🔹 ELIMINAR IMAGEN (debe ir al final para evitar conflictos)
router.delete(
  "/:imagenId",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.eliminarImagen
);

// 🔹 ELIMINAR TODAS LAS IMÁGENES DE UN EXPEDIENTE
router.delete(
  "/expediente/:expedienteId",
  authorizeModules("control_expedientes"),
  ImagenesExpedientesController.eliminarImagenesPorExpediente
);

export default router;
