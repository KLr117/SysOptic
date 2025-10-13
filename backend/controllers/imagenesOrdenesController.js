import ImagenesOrdenesModel from '../models/imagenesOrdenesModel.js';
import { updateImagenes } from '../models/OrdenTrabajoModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

let currentOrdenId = null;
// Middleware para capturar orden_id antes de procesar el archivo
export const setOrdenIdMiddleware = (req, res, next) => {
  currentOrdenId = req.body?.orden_id || req.query?.orden_id || 'sinID';
  next();
};


// Configuración de multer para subir archivos
// =====================================================
// ⚙️ Configuración de Multer (local temporal)
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ordenes');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `orden_${currentOrdenId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});


export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
  },
});

// ===============================
// 🔧 Función auxiliar para subir al FTP
// ===============================
async function subirAFtp(localPath, remoteFileName, subcarpeta) {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: process.env.NODE_ENV === 'production', // 🔐 solo usa TLS en producción
      secureOptions: { rejectUnauthorized: false },
    });

    // 🧭 Determina carpeta FTP correcta
    const remoteDir =
      process.env.NODE_ENV === 'production'
        ? `/public_html/uploads/${subcarpeta}` // Hostinger
        : `/uploads/${subcarpeta}`; // local (FileZilla)

    await client.ensureDir(remoteDir);
    await client.uploadFrom(localPath, remoteFileName);

    console.log(`✅ Imagen subida: ${remoteDir}/${remoteFileName}`);
    client.close();
    return true;
  } catch (err) {
    console.error('❌ Error al subir al FTP:', err.message);
    client.close();
    return false;
  }
}


class ImagenesOrdenesController {
  // 🔼 Subir imagen
  static async subirImagen(req, res) {
    try {
      const { orden_id } = req.body;
      if (!orden_id) return res.status(400).json({ success: false, message: 'ID de orden es requerido' });
      if (!req.file) return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });

      const localPath = req.file.path;
      const remoteFileName = req.file.filename;
      const subidaExitosa = await subirAFtp(localPath, remoteFileName, 'ordenes');

      if (!subidaExitosa) {
        return res.status(500).json({ success: false, message: 'Error al subir imagen al servidor remoto' });
      }

      // 💾 Guardar datos en BD
      const imagenData = {
        orden_id: parseInt(orden_id),
        nombre_archivo: req.file.originalname,
        ruta_archivo: `/uploads/ordenes/${remoteFileName}`,
      };

      const result = await ImagenesOrdenesModel.crearImagen(imagenData);
      if (result.success) {
        await updateImagenes(parseInt(orden_id), true);
        // 🧹 Eliminar copia local temporal
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

        return res.status(201).json({
          success: true,
          message: 'Imagen subida exitosamente',
          imagen: { id: result.id, ...imagenData },
        });
      }

      res.status(500).json({ success: false, message: 'Error al guardar imagen en la base de datos' });
    } catch (error) {
      console.error('Error en subirImagen:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }


  // 📋 Obtener imágenes por orden
  static async obtenerImagenesPorOrden(req, res) {
    try {
      const { ordenId } = req.params;
      const result = await ImagenesOrdenesModel.obtenerImagenesPorOrden(ordenId);
      if (result.success) return res.json({ success: true, imagenes: result.imagenes });
      res.status(500).json({ success: false, message: 'Error al obtener imágenes' });
    } catch (error) {
      console.error('Error en obtenerImagenesPorOrden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  // Obtener todas las imágenes
  static async obtenerTodasLasImagenes(req, res) {
    try {
      const result = await ImagenesOrdenesModel.obtenerTodasLasImagenes();
      
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

// 🗑️ Eliminar imagen del FTP y BD
  static async eliminarImagen(req, res) {
    try {
      const { imagenId } = req.params;
      const result = await ImagenesOrdenesModel.obtenerImagenPorId(imagenId);
      if (!result.success || !result.imagen)
        return res.status(404).json({ success: false, message: 'Imagen no encontrada' });

      const imagen = result.imagen;
      const remotePath =
        process.env.NODE_ENV === 'production'
          ? `/public_html${imagen.ruta_archivo}`
          : `${imagen.ruta_archivo}`;

      const client = new ftp.Client();
      client.ftp.verbose = false;
      try {
        await client.access({
          host: process.env.FTP_HOST,
          user: process.env.FTP_USER,
          password: process.env.FTP_PASS,
          secure: process.env.NODE_ENV === 'production',
          secureOptions: { rejectUnauthorized: false },
        });
        await client.remove(remotePath);
        console.log(`🧹 Archivo eliminado del FTP: ${remotePath}`);
        client.close();
      } catch (ftpErr) {
        console.error('⚠️ Error eliminando archivo del FTP:', ftpErr.message);
        client.close();
      }

      const deleteResult = await ImagenesOrdenesModel.eliminarImagen(imagenId);
      if (deleteResult.success)
        res.json({ success: true, message: 'Imagen eliminada correctamente (FTP + BD)' });
      else
        res.status(500).json({ success: false, message: 'Error al eliminar imagen en BD', error: deleteResult.error });
    } catch (error) {
      console.error('Error en eliminarImagen:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }
  
  // Contar imágenes por orden
  static async contarImagenesPorOrden(req, res) {
    try {
      const { ordenId } = req.params;
      
      const result = await ImagenesOrdenesModel.contarImagenesPorOrden(ordenId);
      
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
      console.error('Error en contarImagenesPorOrden:', error);
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
      const result = await ImagenesOrdenesModel.obtenerImagenPorId(imagenId);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const imagen = result.imagen;
      const rutaNormalizada = imagen.ruta_archivo.replace(/^\/+/, '');

      // Ahora apunta directamente al directorio base local (para modo pruebas local)
      const rutaCompleta = path.join(process.cwd(), 'public', rutaNormalizada);

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

export { ImagenesOrdenesController};
