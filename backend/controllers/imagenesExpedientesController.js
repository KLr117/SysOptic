import ImagenesExpedientesModel from "../models/imagenesExpedientesModel.js";
import { updateFotosExpediente } from "../models/ExpedientesModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// ==========================
// Configuración de multer (temporal en /tmp)
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = process.env.TEMP || "/tmp";
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `expediente_${req.body.expediente_id}_${uniqueSuffix}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
  },
});

// ==========================
// 🔧 Subir imagen a Hostinger por HTTP (en lugar de FTP)
// ==========================
async function subirAHostinger(localPath, subcarpeta) {
  const form = new FormData();
  form.append("folder", subcarpeta);
  form.append("file", fs.createReadStream(localPath));
  form.append("token", process.env.UPLOAD_TOKEN || "sysoptic_secret");

  try {
    const response = await fetch(
      "https://lightsteelblue-termite-871777.hostingersite.com/upload-handler.php",
      { method: "POST", body: form }
    );

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Error en subida");
    return data.url; // URL pública de la imagen
  } catch (err) {
    console.error("❌ Error al subir a Hostinger:", err.message);
    return null;
  }
}

class ImagenesExpedientesController {
  // 🔼 Subir imagen
  static async subirImagen(req, res) {
    try {
      const { expediente_id } = req.body;
      if (!expediente_id)
        return res
          .status(400)
          .json({ success: false, message: "ID de expediente es requerido" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "No se proporcionó archivo" });

      const localPath = req.file.path;

      // 🔄 Subir al Hostinger
      const publicUrl = await subirAHostinger(localPath, "expedientes");
      if (!publicUrl)
        return res.status(500).json({
          success: false,
          message: "Error al subir imagen a Hostinger",
        });

      // 💾 Guardar metadatos en BD
      const imagenData = {
        expediente_id: parseInt(expediente_id),
        nombre_archivo: req.file.originalname,
        ruta_archivo: publicUrl,
      };

      const result = await ImagenesExpedientesModel.crearImagen(imagenData);
      if (result.success) {
        await updateFotosExpediente(parseInt(expediente_id), true);
        fs.unlinkSync(localPath); // eliminar temporal
        res.status(201).json({
          success: true,
          message: "Imagen subida exitosamente",
          imagen: { id: result.id, ...imagenData },
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al guardar imagen en la base de datos",
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error en subirImagen:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
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

      if (imagenInfo.imagen?.ruta_archivo) {
        try {
          const response = await fetch(process.env.HOSTINGER_UPLOAD_URL, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.UPLOAD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ruta: imagenInfo.imagen.ruta_archivo }),
          });
          const resultDelete = await response.json();
          console.log("🗑️ Resultado eliminación archivo Hostinger:", resultDelete);
        } catch (error) {
          console.error("⚠️ No se pudo eliminar archivo físico:", error.message);
        }
      }
      
      if (result.success) {
        // Verificar si quedan imágenes para este expediente
        const imagenesRestantes = await ImagenesExpedientesModel.contarImagenesPorExpediente(expedienteId);
        const tieneImagenes = imagenesRestantes.count > 0;
        
      // Actualizar el campo fotos
      try {
        await updateFotosExpediente(expedienteId, tieneImagenes);
      } catch (updateError) {
        console.error('Error actualizando campo fotos:', updateError);
        // Continuar aunque falle la actualización del campo fotos
      }
        
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
      console.log('🔍 Servir imagen - ID:', imagenId);
      
      // Obtener información de la imagen desde la BD
      const result = await ImagenesExpedientesModel.obtenerImagenPorId(imagenId);
      console.log('🔍 Resultado BD:', result);
      
      if (!result.success) {
        console.log('❌ Imagen no encontrada en BD');
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const imagen = result.imagen;
      console.log('🔍 Imagen desde BD:', imagen);
      
      const rutaCompleta = path.resolve(imagen.ruta_archivo);
      console.log('🔍 Ruta completa:', rutaCompleta);
      
      // Verificar que el archivo existe físicamente
      if (!fs.existsSync(rutaCompleta)) {
        console.log('❌ Archivo no existe físicamente:', rutaCompleta);
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

}

export { ImagenesExpedientesController, upload};