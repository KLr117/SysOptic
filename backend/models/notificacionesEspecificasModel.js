import pool from "../database/db.js";

// ==============================
// 📩 CREAR NOTIFICACIÓN ESPECÍFICA
// ==============================
export const crearNotificacionExpediente = async (data) => {
  const query = `
    INSERT INTO tbl_notificaciones (
      titulo, descripcion, fk_id_tipo_notificacion, fk_id_categoria_notificacion,
      fk_id_modulo_notificacion, fk_id_estado_notificacion, fk_id_expediente,
      intervalo_dias, tipo_intervalo, enviar_email, asunto_email, cuerpo_email,
      fecha_objetivo, fecha_fin
    )
    VALUES (?, ?, 2, ?, 1, 1, ?, ?, 'despues_registro', ?, ?, ?, ?, ?)
  `;
  const params = [
    data.titulo,
    data.descripcion,
    data.fk_id_categoria_notificacion || 1,
    data.expedienteId,
    data.intervalo_dias,
    data.enviar_email,
    data.asunto_email,
    data.cuerpo_email,
    data.fecha_objetivo || null,
    data.fecha_fin || null,
  ];
  await pool.execute(query, params);
};

export const crearNotificacionOrden = async (data) => {
  const query = `
    INSERT INTO tbl_notificaciones (
      titulo, descripcion, fk_id_tipo_notificacion, fk_id_categoria_notificacion,
      fk_id_modulo_notificacion, fk_id_estado_notificacion, fk_id_orden,
      intervalo_dias, tipo_intervalo, enviar_email, asunto_email, cuerpo_email,
      fecha_objetivo, fecha_fin
    )
    VALUES (?, ?, 2, ?, 2, 1, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.titulo,
    data.descripcion,
    data.fk_id_categoria_notificacion || 1,
    data.ordenId,
    data.intervalo_dias,
    data.tipo_intervalo,
    data.enviar_email,
    data.asunto_email,
    data.cuerpo_email,
    data.fecha_objetivo || null,
    data.fecha_fin || null,
  ];
  await pool.execute(query, params);
};

// ==============================
// 📋 OBTENER NOTIFICACIONES
// ==============================
export const obtenerPorExpediente = async (expedienteId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM tbl_notificaciones WHERE fk_id_expediente = ? LIMIT 1",
    [expedienteId]
  );
  return rows[0] || null;
};

export const obtenerPorOrden = async (ordenId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM tbl_notificaciones WHERE fk_id_orden = ? LIMIT 1",
    [ordenId]
  );
  return rows[0] || null;
};

export const obtenerPorId = async (id) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      n.*,
      (
        SELECT COUNT(*) 
        FROM tbl_notificaciones_enviadas ne 
        WHERE ne.fk_id_notificacion = n.pk_id_notificacion
      ) AS correos_enviados
    FROM tbl_notificaciones n
    WHERE n.pk_id_notificacion = ?
      AND (n.fk_id_expediente IS NOT NULL OR n.fk_id_orden IS NOT NULL)
    LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
};

// ==============================
// ✏️ EDITAR Y ELIMINAR
// ==============================
export const editarNotificacion = async (id, data) => {
  const query = `
    UPDATE tbl_notificaciones
    SET titulo = ?, descripcion = ?, fk_id_categoria_notificacion = ?, 
        intervalo_dias = ?, tipo_intervalo = ?, enviar_email = ?, 
        asunto_email = ?, cuerpo_email = ?, fecha_objetivo = ?, fecha_fin = ?
    WHERE pk_id_notificacion = ?
  `;
  const params = [
    data.titulo,
    data.descripcion,
    data.fk_id_categoria_notificacion || 1,
    data.intervalo_dias,
    data.tipo_intervalo,
    data.enviar_email,
    data.asunto_email,
    data.cuerpo_email,
    data.fecha_objetivo || null,
    data.fecha_fin || null,
    id,
  ];
  await pool.execute(query, params);
};

export const eliminarNotificacion = async (id) => {
  await pool.execute(
    "DELETE FROM tbl_notificaciones WHERE pk_id_notificacion = ?",
    [id]
  );
};

// ==============================
// ✅ ESTADO DE NOTIFICACIÓN
// ==============================
export const obtenerEstadoPorExpediente = async (expedienteId) => {
  const [rows] = await pool.execute(
    `SELECT pk_id_notificacion AS id, titulo, fk_id_estado_notificacion AS estado_id
     FROM tbl_notificaciones WHERE fk_id_expediente = ? LIMIT 1`,
    [expedienteId]
  );
  return rows[0] || null;
};

export const obtenerEstadoPorOrden = async (ordenId) => {
  const [rows] = await pool.execute(
    `SELECT pk_id_notificacion AS id, titulo, fk_id_estado_notificacion AS estado_id
     FROM tbl_notificaciones WHERE fk_id_orden = ? LIMIT 1`,
    [ordenId]
  );
  return rows[0] || null;
};
