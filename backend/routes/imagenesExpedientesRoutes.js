import express from 'express';
import { ImagenesExpedientesController, upload } from '../controllers/imagenesExpedientesController.js';
// import { authMiddleware } from '../middlewares/Auth.js'; // Puedes activarlo cuando manejes autenticación

const router = express.Router();

// Middleware de autenticación (opcional por ahora)
// router.use(authMiddleware);

// 📸 Subir imagen de expediente
router.post('/subir', upload.single('imagen'), ImagenesExpedientesController.subirImagen);

// 📂 Obtener imágenes de un expediente específico
router.get('/expediente/:expedienteId', ImagenesExpedientesController.obtenerImagenesPorExpediente);

// 📋 Obtener todas las imágenes de expedientes
router.get('/todas', ImagenesExpedientesController.obtenerTodasLasImagenes);

// 🔢 Contar imágenes por expediente
router.get('/contar/:expedienteId', ImagenesExpedientesController.contarImagenesPorExpediente);

// 🖼️ Servir imagen por ID
router.get('/servir/:imagenId', ImagenesExpedientesController.servirImagen);

// ❌ Eliminar imagen (debe ir al final)
router.delete('/:imagenId', ImagenesExpedientesController.eliminarImagen);

export default router;
