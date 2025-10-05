import pool from "../database/db.js";

// Crear notificación (config general)
export const createNotificacion = async (data) => {
  const query = `
    INSERT INTO tbl_notificaciones 
    (titulo, descripcion, fecha_objetivo, fecha_fin, intervalo_dias,
     tipo_intervalo, fk_id_categoria_notificacion, enviar_email, asunto_email, cuerpo_email,
     fk_id_tipo_notificacion, fk_id_modulo_notificacion, fk_id_estado_notificacion,
     fk_id_expediente, fk_id_orden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [
    data.titulo,
    data.descripcion,
    data.fecha_objetivo || null, // fecha_objetivo: En promo se usa como Fecha_inicio, pero en notificaciones especificas se usa para calculos por registro.
    data.fechaFin || null,
    data.intervaloDias,
    data.tipo_intervalo || null, // En promo no se usa | Para otro categoria:  'despues_registro' | 'antes_entrega' | 'despues_recepcion'
    data.fk_id_categoria_notificacion,
    data.enviarEmail ? 1 : 0,
    data.asuntoEmail,
    data.cuerpoEmail,
    data.fk_id_tipo_notificacion,       // 1=General, 2=Específica
    data.fk_id_modulo_notificacion,     // 1=Expedientes, 2=Ordenes
    data.fk_id_estado_notificacion || 1,
    data.fk_id_expediente || null,
    data.fk_id_orden || null
  ]);
  return result.insertId;
};

// Listar todas (incluye tipo_intervalo y catálogos)
export const getNotificaciones = async () => {
  const query = `
    SELECT 
      n.*,
      c.nombre_categoria, 
      t.nombre_tipo, 
      m.nombre_modulo, 
      e.nombre_estado
    FROM tbl_notificaciones n
    LEFT JOIN tbl_categorias_notificacion c ON n.fk_id_categoria_notificacion = c.pk_id_categoria_notificacion
    LEFT JOIN tbl_tipos_notificacion t ON n.fk_id_tipo_notificacion = t.pk_id_tipo_notificacion
    LEFT JOIN tbl_modulos_notificacion m ON n.fk_id_modulo_notificacion = m.pk_id_modulo_notificacion
    LEFT JOIN tbl_estados_notificacion e ON n.fk_id_estado_notificacion = e.pk_id_estado_notificacion
    ORDER BY n.fecha_creacion DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};
export const getNotificacionById = async (id) => {
  const query = `
    SELECT 
      n.*,
      c.nombre_categoria, 
      t.nombre_tipo, 
      m.nombre_modulo, 
      e.nombre_estado
    FROM tbl_notificaciones n
    LEFT JOIN tbl_categorias_notificacion c ON n.fk_id_categoria_notificacion = c.pk_id_categoria_notificacion
    LEFT JOIN tbl_tipos_notificacion t ON n.fk_id_tipo_notificacion = t.pk_id_tipo_notificacion
    LEFT JOIN tbl_modulos_notificacion m ON n.fk_id_modulo_notificacion = m.pk_id_modulo_notificacion
    LEFT JOIN tbl_estados_notificacion e ON n.fk_id_estado_notificacion = e.pk_id_estado_notificacion
    WHERE n.pk_id_notificacion = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(query, [id]);
  return rows[0];
};

// Actualizar config general
export const updateNotificacion = async (id, data) => {
  const query = `
    UPDATE tbl_notificaciones SET
      titulo = ?, descripcion = ?, 
      fecha_objetivo = ?,
      fecha_fin = ?, intervalo_dias = ?, tipo_intervalo = ?,
      fk_id_categoria_notificacion = ?, enviar_email = ?, asunto_email = ?, cuerpo_email = ?,
      fk_id_modulo_notificacion = ?, fk_id_estado_notificacion = ?
    WHERE pk_id_notificacion = ?
  `;
  const [result] = await pool.query(query, [
    data.titulo,
    data.descripcion,
    data.fecha_objetivo || null,
    data.fechaFin || null,
    data.intervaloDias,
    data.tipo_intervalo || null, // En promo no se usa | Para otro categoria:  'despues_registro' | 'antes_entrega' | 'despues_recepcion'
    data.fk_id_categoria_notificacion,
    data.enviarEmail ? 1 : 0,
    data.asuntoEmail,
    data.cuerpoEmail,
    data.fk_id_modulo_notificacion,
    data.fk_id_estado_notificacion,
    id
  ]);
  return result.affectedRows;
};

export const deleteNotificacion = async (id) => {
  const query = `DELETE FROM tbl_notificaciones WHERE pk_id_notificacion = ?`;
  const [result] = await pool.query(query, [id]);
  return result.affectedRows;
};

// 🔁 Cambiar el estado de una notificación
export const updateEstadoNotificacion = async (id, nuevoEstadoId) => {
  const connection = await pool.getConnection();
  try {
    // Validar que exista el estado
    const [estadoRows] = await connection.query(
      "SELECT pk_id_estado_notificacion FROM tbl_estados_notificacion WHERE pk_id_estado_notificacion = ?",
      [nuevoEstadoId]
    );
    if (estadoRows.length === 0) {
      throw new Error("El estado indicado no existe.");
    }

    // Actualizar el estado de la notificación
    const [result] = await connection.query(
      `UPDATE tbl_notificaciones 
       SET fk_id_estado_notificacion = ? 
       WHERE pk_id_notificacion = ?`,
      [nuevoEstadoId, id]
    );

    if (result.affectedRows === 0) {
      throw new Error("No se encontró la notificación especificada.");
    }

    return { success: true, message: "Estado actualizado correctamente." };
  } catch (error) {
    console.error("Error en updateEstadoNotificacion:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};