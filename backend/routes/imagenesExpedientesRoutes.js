import express from 'express';
import { ImagenesExpedientesController, upload } from '../controllers/imagenesExpedientesController.js';

const router = express.Router();

// Ruta para subir imagen de expediente
// POST /api/imagenes-expedientes/subir
// Body: FormData con 'imagen' (archivo) y 'expediente_id' (número)
router.post('/subir', upload.single('imagen'), ImagenesExpedientesController.subirImagen);

// Ruta para obtener todas las imágenes de un expediente específico
// GET /api/imagenes-expedientes/expediente/:expedienteId
router.get('/expediente/:expedienteId', ImagenesExpedientesController.obtenerImagenesPorExpediente);

// Ruta para obtener todas las imágenes (administración)
// GET /api/imagenes-expedientes/todas
router.get('/todas', ImagenesExpedientesController.obtenerTodasLasImagenes);

// Ruta para eliminar imagen específica
// DELETE /api/imagenes-expedientes/:imagenId
router.delete('/:imagenId', ImagenesExpedientesController.eliminarImagen);

// Ruta para contar imágenes de un expediente
// GET /api/imagenes-expedientes/contar/:expedienteId
router.get('/contar/:expedienteId', ImagenesExpedientesController.contarImagenesPorExpediente);

// Ruta para servir imagen por ID (mostrar imagen en el navegador)
// GET /api/imagenes-expedientes/servir/:imagenId
router.get('/servir/:imagenId', ImagenesExpedientesController.servirImagen);

// Ruta para servir imagen por ruta directa (alternativa) - TEMPORALMENTE DESHABILITADA
// router.get('/servir-ruta/*', ImagenesExpedientesController.servirImagenPorRuta);

export default router;