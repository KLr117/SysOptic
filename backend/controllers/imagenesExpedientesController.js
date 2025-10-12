import ImagenesExpedientesModel from '../models/imagenesExpedientesModel.js';
import { updateFotosExpediente } from '../models/ExpedientesModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear directorio de uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'expedientes');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para evitar conflictos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Formato: expediente_ID_timestamp_random.extensión
    cb(null, `expediente_${req.body.expediente_id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configuración de multer con límites y filtros
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo por archivo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir tipos de imagen específicos
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true); // Aceptar archivo
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

class ImagenesExpedientesController {
  // Subir imagen para expediente
  static async subirImagen(req, res) {
    try {
      const { expediente_id } = req.body;
      
      // Validar que se proporcionó ID de expediente
      if (!expediente_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de expediente es requerido'
        });
      }

      // Validar que se proporcionó archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo'
        });
      }

      // Preparar datos de la imagen para guardar en BD
      const imagenData = {
        expediente_id: parseInt(expediente_id),
        nombre_archivo: req.file.originalname, // Nombre original del archivo
        ruta_archivo: `/uploads/expedientes/${req.file.filename}` // Ruta relativa para servir desde el servidor web
      };

      // Guardar metadatos de la imagen en la base de datos
      const result = await ImagenesExpedientesModel.crearImagen(imagenData);
      
      if (result.success) {
        // Actualizar campo fotos en el expediente
        await updateFotosExpediente(parseInt(expediente_id), true);
        
        res.status(201).json({
          success: true,
          message: 'Imagen subida exitosamente',
          imagen: {
            id: result.id,
            ...imagenData
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al guardar imagen en la base de datos',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error en subirImagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener imágenes de un expediente específico
  static async obtenerImagenesPorExpediente(req, res) {
    try {
      const { expedienteId } = req.params;
      
      const result = await ImagenesExpedientesModel.obtenerImagenesPorExpediente(expedienteId);
      
      if (result.success) {
        res.json({
          success: true,
          imagenes: result.imagenes
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al obtener imágenes',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error en obtenerImagenesPorExpediente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener todas las imágenes (para administración)
  static async obtenerTodasLasImagenes(req, res) {
    try {
      const result = await ImagenesExpedientesModel.obtenerTodasLasImagenes();
      
      if (result.success) {
        res.json({
          success: true,
          imagenes: result.imagenes
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al obtener imágenes',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error en obtenerTodasLasImagenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar imagen específica
  static async eliminarImagen(req, res) {
    try {
      const { imagenId } = req.params;
      
      // Primero obtener el expediente_id de la imagen antes de eliminarla
      const imagenInfo = await ImagenesExpedientesModel.obtenerImagenPorId(imagenId);
      if (!imagenInfo.success) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }
      
      const expedienteId = imagenInfo.imagen.expediente_id;
      
      // Eliminar la imagen
      const result = await ImagenesExpedientesModel.eliminarImagen(imagenId);
      
      if (result.success) {
        // Verificar si quedan imágenes para este expediente
        const imagenesRestantes = await ImagenesExpedientesModel.contarImagenesPorExpediente(expedienteId);
        const tieneImagenes = imagenesRestantes.count > 0;
        
        // Actualizar el campo fotos
        await updateFotosExpediente(expedienteId, tieneImagenes);
        
        res.json({
          success: true,
          message: 'Imagen eliminada exitosamente',
          affectedRows: result.affectedRows,
          tieneImagenes: tieneImagenes
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar imagen',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error en eliminarImagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Contar imágenes por expediente
  static async contarImagenesPorExpediente(req, res) {
    try {
      const { expedienteId } = req.params;
      
      const result = await ImagenesExpedientesModel.contarImagenesPorExpediente(expedienteId);
      
      if (result.success) {
        res.json({
          success: true,
          total: result.total
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al contar imágenes',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error en contarImagenesPorExpediente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Servir imagen por ID (para mostrar en el frontend)
  static async servirImagen(req, res) {
    try {
      const { imagenId } = req.params;
      
      // Obtener información de la imagen desde la BD
      const result = await ImagenesExpedientesModel.obtenerImagenPorId(imagenId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const imagen = result.imagen;
      const rutaCompleta = path.resolve(imagen.ruta_archivo);
      
      // Verificar que el archivo existe físicamente
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de imagen no encontrado en el servidor'
        });
      }

      // Determinar el tipo de contenido según la extensión
      const ext = path.extname(imagen.nombre_archivo).toLowerCase();
      let contentType = 'image/jpeg'; // Por defecto
      
      switch (ext) {
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.jpg':
        case '.jpeg':
        default:
          contentType = 'image/jpeg';
      }

      // Configurar headers HTTP para servir la imagen
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${imagen.nombre_archivo}"`);
      
      // Enviar el archivo al cliente
      res.sendFile(rutaCompleta);
      
    } catch (error) {
      console.error('Error en servirImagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Servir imagen por ruta directa (alternativa) - TEMPORALMENTE DESHABILITADA
  // static async servirImagenPorRuta(req, res) {
  //   // Función comentada para evitar errores de ruta
  // }
}

export { ImagenesExpedientesController, upload };