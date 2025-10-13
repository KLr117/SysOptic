import ImagenesExpedientesModel from '../models/imagenesExpedientesModel.js';
import { updateFotosExpediente } from '../models/ExpedientesModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

// Configuración de multer para subir archivos
// Configuración de multer (guarda temporalmente en /tmp antes de subir al FTP)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = process.env.TEMP || '/tmp';
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `expediente_${req.body.expediente_id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
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

// 🔧 Nueva función auxiliar para subir al FTP
async function subirAFtp(localPath, remoteFileName, subcarpeta) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: true,
    });
    await client.ensureDir(`/public_html/public/uploads/${subcarpeta}`);
    await client.uploadFrom(localPath, `${remoteFileName}`);
    client.close();
    return true;
  } catch (err) {
    console.error("❌ Error al subir al FTP:", err);
    client.close();
    return false;
  }
}

class ImagenesExpedientesController {
  // Subir imagen para expediente
  static async subirImagen(req, res) {
    try {
      const { expediente_id } = req.body;
      if (!expediente_id) {
        return res.status(400).json({ success: false, message: 'ID de expediente es requerido' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
      }

      // Subir al FTP Hostinger
      const localPath = req.file.path;
      const remoteFileName = req.file.filename;
      const subidaExitosa = await subirAFtp(localPath, remoteFileName, "expedientes");

      if (!subidaExitosa) {
        return res.status(500).json({
          success: false,
          message: 'Error al subir imagen al servidor remoto',
        });
      }

      // Guardar metadatos en BD (con ruta pública)
      const imagenData = {
        expediente_id: parseInt(expediente_id),
        nombre_archivo: req.file.originalname,
        ruta_archivo: `/public/uploads/expedientes/${remoteFileName}`,
      };

      const result = await ImagenesExpedientesModel.crearImagen(imagenData);

      if (result.success) {
        await updateFotosExpediente(parseInt(expediente_id), true);
        res.status(201).json({
          success: true,
          message: 'Imagen subida exitosamente',
          imagen: { id: result.id, ...imagenData },
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al guardar imagen en la base de datos',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Error en subirImagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
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

  // ==========================
// 🗑️ ELIMINAR IMAGEN (FTP + BD)
// ==========================
static async eliminarImagen(req, res) {
  try {
    const { imagenId } = req.params;

    // Obtener la información de la imagen
    const imagenInfo = await ImagenesExpedientesModel.obtenerImagenPorId(imagenId);
    if (!imagenInfo.success || !imagenInfo.imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const expedienteId = imagenInfo.imagen.expediente_id;
    const remotePath = `/public_html${imagenInfo.imagen.ruta_archivo}`; // Ruta completa en Hostinger

    // ==========================
    // 🔌 Conexión FTP para eliminar el archivo remoto
    // ==========================
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASS,
        secure: false,
      });

      await client.remove(remotePath);
      console.log(`🧹 Archivo eliminado del FTP: ${remotePath}`);
      client.close();
    } catch (ftpErr) {
      console.error("⚠️ Error eliminando archivo del FTP:", ftpErr.message);
      client.close();
      // No detenemos el proceso si falla el FTP
    }

    // ==========================
    // 🗑️ Eliminar registro en la base de datos
    // ==========================
    const result = await ImagenesExpedientesModel.eliminarImagen(imagenId);

    if (result.success) {
      // Verificar si quedan imágenes para este expediente
      const imagenesRestantes = await ImagenesExpedientesModel.contarImagenesPorExpediente(expedienteId);
      const tieneImagenes = imagenesRestantes.count > 0;

      // Actualizar campo fotos
      await updateFotosExpediente(expedienteId, tieneImagenes);

      res.json({
        success: true,
        message: 'Imagen eliminada correctamente (FTP + BD)',
        affectedRows: result.affectedRows,
        tieneImagenes
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar imagen en la base de datos',
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