import express from 'express';
import { ImagenesOrdenesController, upload } from '../controllers/imagenesOrdenesController.js';
import { authMiddleware } from '../middlewares/Auth.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
// router.use(authMiddleware); // Temporalmente deshabilitado para pruebas

// Subir imagen
router.post('/subir', upload.single('imagen'), ImagenesOrdenesController.subirImagen);

// Obtener imágenes de una orden específica
// router.get('/orden/:ordenId', ImagenesOrdenesController.obtenerImagenesPorOrden);

// Obtener todas las imágenes
router.get('/todas', ImagenesOrdenesController.obtenerTodasLasImagenes);

// Contar imágenes por orden
router.get('/contar/:ordenId', ImagenesOrdenesController.contarImagenesPorOrden);

// Servir imagen por ID
router.get('/servir/:imagenId', ImagenesOrdenesController.servirImagen);

// Servir imagen por ruta (para rutas codificadas) - Temporalmente deshabilitado
// router.get('/servir-ruta/*', ImagenesOrdenesController.servirImagenPorRuta);

// Eliminar imagen (debe ir al final para evitar conflictos)
router.delete('/:imagenId', ImagenesOrdenesController.eliminarImagen);

export default router;
