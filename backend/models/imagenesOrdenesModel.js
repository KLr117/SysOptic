import db from '../database/db.js';

class ImagenesOrdenesModel {
  // Crear nueva imagen
  static async crearImagen(imagenData) {
    const { orden_id, nombre_archivo, ruta_archivo } = imagenData;
    
    const query = `
      INSERT INTO tbl_imagenes_ordenes (orden_id, nombre_archivo, ruta_archivo) 
      VALUES (?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [orden_id, nombre_archivo, ruta_archivo]);
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Error creando imagen:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener imágenes de una orden específica
  static async obtenerImagenesPorOrden(ordenId) {
    const query = `
      SELECT 
        io.id,
        io.orden_id,
        io.nombre_archivo,
        io.ruta_archivo,
        io.fecha_subida,
        ot.correlativo,
        ot.paciente
      FROM tbl_imagenes_ordenes io
      JOIN tbl_ordenes ot ON io.orden_id = ot.pk_id_orden
      WHERE io.orden_id = ?
      ORDER BY io.fecha_subida DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [ordenId]);
      return { success: true, imagenes: rows };
    } catch (error) {
      console.error('Error obteniendo imágenes:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las imágenes
  static async obtenerTodasLasImagenes() {
    const query = `
      SELECT 
        io.id,
        io.orden_id,
        io.nombre_archivo,
        io.ruta_archivo,
        io.fecha_subida,
        ot.correlativo,
        ot.paciente
      FROM tbl_imagenes_ordenes io
      JOIN tbl_ordenes ot ON io.orden_id = ot.pk_id_orden
      ORDER BY io.fecha_subida DESC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return { success: true, imagenes: rows };
    } catch (error) {
      console.error('Error obteniendo todas las imágenes:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar imagen
  static async eliminarImagen(imagenId) {
    const query = 'DELETE FROM tbl_imagenes_ordenes WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [imagenId]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar todas las imágenes de una orden
  static async eliminarImagenesPorOrden(ordenId) {
    const query = 'DELETE FROM tbl_imagenes_ordenes WHERE orden_id = ?';
    
    try {
      const [result] = await db.execute(query, [ordenId]);
      return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
      console.error('Error eliminando imágenes de orden:', error);
      return { success: false, error: error.message };
    }
  }

  // Contar imágenes por orden
  static async contarImagenesPorOrden(ordenId) {
    const query = 'SELECT COUNT(*) as total FROM tbl_imagenes_ordenes WHERE orden_id = ?';
    
    try {
      const [rows] = await db.execute(query, [ordenId]);
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
        io.id,
        io.orden_id,
        io.nombre_archivo,
        io.ruta_archivo,
        io.fecha_subida,
        ot.correlativo,
        ot.paciente
      FROM tbl_imagenes_ordenes io
      JOIN tbl_ordenes ot ON io.orden_id = ot.pk_id_orden
      WHERE io.id = ?
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

export default ImagenesOrdenesModel;
