import db from '../database/db.js';

class ImagenesExpedientesModel {
  // Crear nueva imagen
  static async crearImagen(imagenData) {
    const { expediente_id, nombre_archivo, ruta_archivo } = imagenData;

    const query = `
      INSERT INTO tbl_imagenes_expedientes (expediente_id, nombre_archivo, ruta_archivo)
      VALUES (?, ?, ?)
    `;

    try {
      const [result] = await db.execute(query, [expediente_id, nombre_archivo, ruta_archivo]);
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Error creando imagen:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener imágenes de un expediente específico
  static async obtenerImagenesPorExpediente(expedienteId) {
    const query = `
      SELECT 
        ie.id,
        ie.expediente_id,
        ie.nombre_archivo,
        ie.ruta_archivo,
        ie.fecha_subida,
        e.correlativo,
        e.nombre
      FROM tbl_imagenes_expedientes ie
      JOIN tbl_expedientes e ON ie.expediente_id = e.pk_id_expediente
      WHERE ie.expediente_id = ?
      ORDER BY ie.fecha_subida DESC
    `;

    try {
      const [rows] = await db.execute(query, [expedienteId]);
      return { success: true, imagenes: rows };
    } catch (error) {
      console.error('Error obteniendo imágenes del expediente:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las imágenes
  static async obtenerTodasLasImagenes() {
    const query = `
      SELECT 
        ie.id,
        ie.expediente_id,
        ie.nombre_archivo,
        ie.ruta_archivo,
        ie.fecha_subida,
        e.correlativo,
        e.nombre
      FROM tbl_imagenes_expedientes ie
      JOIN tbl_expedientes e ON ie.expediente_id = e.pk_id_expediente
      ORDER BY ie.fecha_subida DESC
    `;

    try {
      const [rows] = await db.execute(query);
      return { success: true, imagenes: rows };
    } catch (error) {
      console.error('Error obteniendo todas las imágenes:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar imagen por ID
  static async eliminarImagen(imagenId) {
    const query = 'DELETE FROM tbl_imagenes_expedientes WHERE id = ?';

    try {
      const [result] = await db.execute(query, [imagenId]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar todas las imágenes de un expediente
  static async eliminarImagenesPorExpediente(expedienteId) {
    const query = 'DELETE FROM tbl_imagenes_expedientes WHERE expediente_id = ?';

    try {
      const [result] = await db.execute(query, [expedienteId]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.error('Error eliminando imágenes del expediente:', error);
      return { success: false, error: error.message };
    }
  }

  // Contar imágenes por expediente
  static async contarImagenesPorExpediente(expedienteId) {
    const query = 'SELECT COUNT(*) as total FROM tbl_imagenes_expedientes WHERE expediente_id = ?';

    try {
      const [rows] = await db.execute(query, [expedienteId]);
      return { success: true, total: rows[0].total };
    } catch (error) {
      console.error('Error contando imágenes:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener imagen por ID
  static async obtenerImagenPorId(imagenId) {
    const query = `
      SELECT 
        ie.id,
        ie.expediente_id,
        ie.nombre_archivo,
        ie.ruta_archivo,
        ie.fecha_subida,
        e.correlativo,
        e.nombre
      FROM tbl_imagenes_expedientes ie
      JOIN tbl_expedientes e ON ie.expediente_id = e.pk_id_expediente
      WHERE ie.id = ?
    `;

    try {
      const [rows] = await db.execute(query, [imagenId]);
      if (rows.length === 0) {
        return { success: false, error: 'Imagen no encontrada' };
      }
      return { success: true, imagen: rows[0] };
    } catch (error) {
      console.error('Error obteniendo imagen por ID:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ImagenesExpedientesModel;
