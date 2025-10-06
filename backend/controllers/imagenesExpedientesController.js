import fs from "fs";
import path from "path";
import multer from "multer";
import { ImagenesExpedientesModel } from "../models/ImagenesExpedientesModel.js";
import { updateImagenesExpediente } from "../helpers/updateImagenesExpediente.js";

// 📸 Configuración de Multer para expedientes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar directorio temporal o personalizado
    const tempDir = process.env.TEMP || "uploads/expedientes";
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `expediente_${req.body.expediente_id}_${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) cb(null, true);
    else cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
  },
});

class ImagenesExpedientesController {
  // 🟢 Subir imagen
  static async subirImagen(req, res) {
    try {
      const { expediente_id } = req.body;

      if (!expediente_id)
        return res.status(400).json({ success: false, message: "ID de expediente es requerido" });

      if (!req.file)
        return res.status(400).json({ success: false, message: "No se proporcionó archivo" });

      const imagenData = {
        expediente_id: parseInt(expediente_id),
        nombre_archivo: req.file.originalname,
        ruta_archivo: req.file.path,
      };

      const result = await ImagenesExpedientesModel.crearImagen(imagenData);

      if (result.success) {
        // Actualizar campo imagenes = TRUE en tbl_expedientes
        await updateImagenesExpediente(parseInt(expediente_id), true);

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

  // 🟢 Obtener imágenes de un expediente
  static async obtenerImagenesPorExpediente(req, res) {
    try {
      const { expedienteId } = req.params;

      const result = await ImagenesExpedientesModel.obtenerImagenesPorExpediente(expedienteId);

      if (result.success)
        res.json({ success: true, imagenes: result.imagenes });
      else
        res.status(500).json({ success: false, message: "Error al obtener imágenes", error: result.error });
    } catch (error) {
      console.error("Error en obtenerImagenesPorExpediente:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // 🟢 Obtener todas las imágenes
  static async obtenerTodasLasImagenes(req, res) {
    try {
      const result = await ImagenesExpedientesModel.obtenerTodasLasImagenes();

      if (result.success)
        res.json({ success: true, imagenes: result.imagenes });
      else
        res.status(500).json({ success: false, message: "Error al obtener imágenes", error: result.error });
    } catch (error) {
      console.error("Error en obtenerTodasLasImagenes:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // 🟢 Eliminar imagen
  static async eliminarImagen(req, res) {
    try {
      const { imagenId } = req.params;
      const result = await ImagenesExpedientesModel.eliminarImagen(imagenId);

      if (result.success)
        res.json({ success: true, message: "Imagen eliminada exitosamente", affectedRows: result.affectedRows });
      else
        res.status(500).json({ success: false, message: "Error al eliminar imagen", error: result.error });
    } catch (error) {
      console.error("Error en eliminarImagen:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // 🟢 Contar imágenes por expediente
  static async contarImagenesPorExpediente(req, res) {
    try {
      const { expedienteId } = req.params;
      const result = await ImagenesExpedientesModel.contarImagenesPorExpediente(expedienteId);

      if (result.success)
        res.json({ success: true, total: result.total });
      else
        res.status(500).json({ success: false, message: "Error al contar imágenes", error: result.error });
    } catch (error) {
      console.error("Error en contarImagenesPorExpediente:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // 🟢 Servir imagen por ID
  static async servirImagen(req, res) {
    try {
      const { imagenId } = req.params;
      const result = await ImagenesExpedientesModel.obtenerImagenPorId(imagenId);

      if (!result.success)
        return res.status(404).json({ success: false, message: "Imagen no encontrada" });

      const imagen = result.imagen;
      const rutaCompleta = path.resolve(imagen.ruta_archivo);

      if (!fs.existsSync(rutaCompleta))
        return res.status(404).json({ success: false, message: "Archivo de imagen no encontrado" });

      const ext = path.extname(imagen.nombre_archivo).toLowerCase();
      const contentTypes = {
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
      };
      const contentType = contentTypes[ext] || "image/jpeg";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${imagen.nombre_archivo}"`);
      res.sendFile(rutaCompleta);
    } catch (error) {
      console.error("Error en servirImagen:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // 🟢 Servir imagen por ruta directa
  static async servirImagenPorRuta(req, res) {
    try {
      const ruta = decodeURIComponent(req.params[0]);
      const rutaCompleta = path.resolve(ruta);

      if (!fs.existsSync(rutaCompleta))
        return res.status(404).json({ success: false, message: "Archivo no encontrado" });

      const ext = path.extname(rutaCompleta).toLowerCase();
      const contentTypes = {
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
      };
      const contentType = contentTypes[ext] || "image/jpeg";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", "inline");
      res.sendFile(rutaCompleta);
    } catch (error) {
      console.error("Error en servirImagenPorRuta:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

export { ImagenesExpedientesController, upload };
