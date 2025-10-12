import express from 'express';
import { ImagenesExpedientesController, upload } from '../controllers/imagenesExpedientesController.js';

const router = express.Router();

// Ruta para subir imagen de expediente
router.post('/subir', upload.single('imagen'), ImagenesExpedientesController.subirImagen);

// Ruta para obtener todas las imágenes de un expediente específico
router.get('/expediente/:expedienteId', ImagenesExpedientesController.obtenerImagenesPorExpediente);

// Ruta para obtener todas las imágenes (administración)
router.get('/todas', ImagenesExpedientesController.obtenerTodasLasImagenes);

// Ruta para eliminar imagen específica
router.delete('/:imagenId', ImagenesExpedientesController.eliminarImagen);

// Ruta para contar imágenes de un expediente
router.get('/contar/:expedienteId', ImagenesExpedientesController.contarImagenesPorExpediente);

// Ruta para servir imagen por ID (mostrar imagen en el navegador)
router.get('/servir/:imagenId', ImagenesExpedientesController.servirImagen);

// Ruta para servir imagen por ruta directa (alternativa) - TEMPORALMENTE DESHABILITADA
// router.get('/servir-ruta/*', ImagenesExpedientesController.servirImagenPorRuta);

export default router;