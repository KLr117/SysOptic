import ImagenesOrdenesModel from "../models/imagenesOrdenesModel.js";
import { updateImagenes } from "../models/OrdenTrabajoModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

let currentOrdenId = null;

export const setOrdenIdMiddleware = (req, res, next) => {
  currentOrdenId = req.body?.orden_id || req.query?.orden_id || "sinID";
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = process.env.TEMP || "/tmp";
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `orden_${currentOrdenId}_${uniqueSuffix}${path.extname(
        file.originalname
      )}`
    );
  },
});

export const upload = multer({
  storage,
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
// 🔧 Subir imagen a Hostinger
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
    return data.url;
  } catch (err) {
    console.error("❌ Error al subir a Hostinger:", err.message);
    return null;
  }
}


class ImagenesOrdenesController {
  // 🔼 Subir imagen
  static async subirImagen(req, res) {
    try {
      const { orden_id } = req.body;
      if (!orden_id)
        return res
          .status(400)
          .json({ success: false, message: "ID de orden es requerido" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "No se proporcionó archivo" });

      const localPath = req.file.path;

      // 🔄 Subir al Hostinger
      const publicUrl = await subirAHostinger(localPath, "ordenes");
      if (!publicUrl)
        return res.status(500).json({
          success: false,
          message: "Error al subir imagen a Hostinger",
        });

      const imagenData = {
        orden_id: parseInt(orden_id),
        nombre_archivo: req.file.originalname,
        ruta_archivo: publicUrl,
      };

      const result = await ImagenesOrdenesModel.crearImagen(imagenData);
      if (result.success) {
        await updateImagenes(parseInt(orden_id), true);
        fs.unlinkSync(localPath);
        return res.status(201).json({
          success: true,
          message: "Imagen subida exitosamente",
          imagen: { id: result.id, ...imagenData },
        });
      }

      res
        .status(500)
        .json({ success: false, message: "Error al guardar imagen en BD" });
    } catch (error) {
      console.error("Error en subirImagen:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
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

// 🗑️ Eliminar imagen (solo BD y actualización lógica)
static async eliminarImagen(req, res) {
  try {
    const { imagenId } = req.params;

    // Obtener info de la imagen
    const imagenInfo = await ImagenesOrdenesModel.obtenerImagenPorId(imagenId);
    if (!imagenInfo.success) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      });
    }

    const ordenId = imagenInfo.imagen.orden_id;

    // Eliminar registro en BD
    const result = await ImagenesOrdenesModel.eliminarImagen(imagenId);

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
      // Verificar si quedan imágenes
      const restantes = await ImagenesOrdenesModel.contarImagenesPorOrden(ordenId);
      const tieneImagenes = restantes.total > 0;

      // Actualizar flag en la tabla ordenes
      try {
        await updateImagenes(ordenId, tieneImagenes);
      } catch (updateErr) {
        console.warn("⚠️ Error actualizando flag de imágenes:", updateErr.message);
      }

      return res.json({
        success: true,
        message: "Imagen eliminada correctamente de la base de datos",
        tieneImagenes,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al eliminar imagen en BD",
      error: result.error,
    });
  } catch (error) {
    console.error("Error en eliminarImagen:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
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
