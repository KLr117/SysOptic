import fs from "fs";
import path from "path";
import { subirAFtp } from "../controllers/imagenesExpedientesController.js";
import pool from "../database/db.js";
import { updateFotosExpediente } from "./ExpedientesModel.js";

class ImagenesExpedientesModel {
  // Crear nueva imagen para expediente
  static async crearImagen(imagenData) {
    try {
      const { expediente_id, nombre_archivo, ruta_archivo } = imagenData;

      // Insertar nueva imagen en la tabla
      const [result] = await pool.query(`
        INSERT INTO tbl_imagenes_expedientes 
        (expediente_id, nombre_archivo, ruta_archivo) 
        VALUES (?, ?, ?)
      `, [expediente_id, nombre_archivo, ruta_archivo]);

      return {
        success: true,
        id: result.insertId, // ID de la imagen creada
        message: 'Imagen creada exitosamente'
      };
    } catch (error) {
      console.error('Error al crear imagen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener todas las imágenes de un expediente específico
  static async obtenerImagenesPorExpediente(expedienteId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id,
          expediente_id,
          nombre_archivo,
          ruta_archivo,
          fecha_subida
        FROM tbl_imagenes_expedientes 
        WHERE expediente_id = ? 
        ORDER BY fecha_subida ASC
      `, [expedienteId]);

      return {
        success: true,
        imagenes: rows
      };
    } catch (error) {
      console.error('Error al obtener imágenes por expediente:', error);
      return {
        success: false,
        error: error.message,
        imagenes: []
      };
    }
  }

  // Obtener todas las imágenes (para administración)
  static async obtenerTodasLasImagenes() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id,
          expediente_id,
          nombre_archivo,
          ruta_archivo,
          fecha_subida
        FROM tbl_imagenes_expedientes 
        ORDER BY fecha_subida DESC
      `);

      return {
        success: true,
        imagenes: rows
      };
    } catch (error) {
      console.error('Error al obtener todas las imágenes:', error);
      return {
        success: false,
        error: error.message,
        imagenes: []
      };
    }
  }

  // Obtener imagen específica por ID
  static async obtenerImagenPorId(imagenId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          id,
          expediente_id,
          nombre_archivo,
          ruta_archivo,
          fecha_subida
        FROM tbl_imagenes_expedientes 
        WHERE id = ?
      `, [imagenId]);

      if (rows.length > 0) {
        return {
          success: true,
          imagen: rows[0]
        };
      } else {
        return {
          success: false,
          message: 'Imagen no encontrada'
        };
      }
    } catch (error) {
      console.error('Error al obtener imagen por ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar imagen específica
  static async eliminarImagen(imagenId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM tbl_imagenes_expedientes 
        WHERE id = ?
      `, [imagenId]);

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: 'Imagen eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Contar imágenes por expediente
  static async contarImagenesPorExpediente(expedienteId) {
    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as total 
        FROM tbl_imagenes_expedientes 
        WHERE expediente_id = ?
      `, [expedienteId]);

      return {
        success: true,
        total: rows[0].total
      };
    } catch (error) {
      console.error('Error al contar imágenes por expediente:', error);
      return {
        success: false,
        error: error.message,
        total: 0
      };
    }
  }

  // Eliminar todas las imágenes de un expediente (cuando se elimina el expediente)
  static async eliminarImagenesPorExpediente(expedienteId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM tbl_imagenes_expedientes 
        WHERE expediente_id = ?
      `, [expedienteId]);

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: 'Imágenes del expediente eliminadas exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar imágenes por expediente:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ImagenesExpedientesModel;
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
