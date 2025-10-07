import express from 'express';
import { ImagenesExpedientesController, upload } from '../controllers/imagenesExpedientesController.js';
import { authMiddleware } from '../middlewares/Auth.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
// router.use(authMiddleware); // Temporalmente deshabilitado para pruebas

// 🔹 SUBIR IMAGEN A EXPEDIENTE
router.post('/subir', upload.single('imagen'), ImagenesExpedientesController.subirImagen);

// 🔹 OBTENER IMÁGENES DE UN EXPEDIENTE ESPECÍFICO
router.get('/expediente/:expedienteId', ImagenesExpedientesController.obtenerImagenesPorExpediente);

// 🔹 OBTENER TODAS LAS IMÁGENES
router.get('/todas', ImagenesExpedientesController.obtenerTodasLasImagenes);

// 🔹 CONTAR IMÁGENES POR EXPEDIENTE
router.get('/contar/:expedienteId', ImagenesExpedientesController.contarImagenesPorExpediente);

// 🔹 SERVIR IMAGEN POR ID
router.get('/servir/:imagenId', ImagenesExpedientesController.servirImagen);

// 🔹 SERVIR IMAGEN POR RUTA (para rutas codificadas)
router.get('/servir-ruta/*', ImagenesExpedientesController.servirImagenPorRuta);

// 🔹 OBTENER IMAGEN POR ID (información)
router.get('/:imagenId', ImagenesExpedientesController.obtenerImagenPorId);

// 🔹 ELIMINAR IMAGEN (debe ir al final para evitar conflictos)
router.delete('/:imagenId', ImagenesExpedientesController.eliminarImagen);

// 🔹 ELIMINAR TODAS LAS IMÁGENES DE UN EXPEDIENTE
router.delete('/expediente/:expedienteId', ImagenesExpedientesController.eliminarImagenesPorExpediente);

export default router;