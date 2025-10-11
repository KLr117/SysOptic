import ImagenesExpedientesModel from '../models/imagenesExpedientesModel.js';
import { updateImagenesExpediente } from '../models/ExpedientesModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subir archivos
// NOTA: Deshabilitado para evitar crear directorios uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // No crear directorio uploads, usar directorio temporal del sistema
    const tempDir = process.env.TEMP || '/tmp';
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `expediente_${req.body.expediente_id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

class ImagenesExpedientesController {
  // Subir imagen
  static async subirImagen(req, res) {
    try {
      const { expediente_id } = req.body;
      
      if (!expediente_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de expediente es requerido'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo'
        });
      }

      const imagenData = {
        expediente_id: parseInt(expediente_id),
        nombre_archivo: req.file.originalname,
        ruta_archivo: req.file.path
      };

      const result = await ImagenesExpedientesModel.crearImagen(imagenData);
      
      if (result.success) {
        // Actualizar campo imagenes en el expediente
        await updateImagenesExpediente(parseInt(expediente_id), true);
        
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

  // Obtener imágenes de un expediente
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

  // Obtener todas las imágenes
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

  // Eliminar imagen
  static async eliminarImagen(req, res) {
    try {
      const { imagenId } = req.params;
      
      const result = await ImagenesExpedientesModel.eliminarImagen(imagenId);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Imagen eliminada exitosamente',
          affectedRows: result.affectedRows
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

  // Servir imagen por ID
  static async servirImagen(req, res) {
    try {
      const { imagenId } = req.params;
      
      // Obtener información de la imagen
      const result = await ImagenesExpedientesModel.obtenerImagenPorId(imagenId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const imagen = result.imagen;
      const rutaCompleta = path.resolve(imagen.ruta_archivo);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de imagen no encontrado en el servidor'
        });
      }

      // Determinar el tipo de contenido
      const ext = path.extname(imagen.nombre_archivo).toLowerCase();
      let contentType = 'image/jpeg';
      
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

      // Establecer headers y enviar archivo
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${imagen.nombre_archivo}"`);
      
      // Enviar el archivo
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

  // Servir imagen por ruta
  static async servirImagenPorRuta(req, res) {
    try {
      // Obtener la ruta desde req.params[0] para rutas con *
      const ruta = req.params[0];
      const rutaDecodificada = decodeURIComponent(ruta);
      const rutaCompleta = path.resolve(rutaDecodificada);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de imagen no encontrado'
        });
      }

      // Determinar el tipo de contenido por extensión
      const ext = path.extname(rutaCompleta).toLowerCase();
      let contentType = 'image/jpeg';
      
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

      // Establecer headers y enviar archivo
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      
      // Enviar el archivo
      res.sendFile(rutaCompleta);
      
    } catch (error) {
      console.error('Error en servirImagenPorRuta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export { ImagenesExpedientesController, upload };