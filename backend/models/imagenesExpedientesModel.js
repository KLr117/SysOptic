import pool from "../database/db.js";

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