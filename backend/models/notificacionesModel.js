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

// 🔎 Promos activas hoy (enviar_email=1, estado=activa, dentro de ventana de fechas)
export const getPromosActivasHoy = async (hoyISO /* 'YYYY-MM-DD' */) => {
  const sql = `
    SELECT 
      pk_id_notificacion,
      titulo,
      asunto_email,
      cuerpo_email,
      fk_id_modulo_notificacion,
      fecha_objetivo,  -- inicio promo
      fecha_fin,
      enviar_email
    FROM tbl_notificaciones
    WHERE fk_id_categoria_notificacion = 2         -- Promoción
      AND fk_id_estado_notificacion = 1            -- Activa
      AND enviar_email = 1
      AND (fecha_objetivo IS NULL OR fecha_objetivo <= ?)
      AND (fecha_fin IS NULL OR fecha_fin >= ?)
  `;
  const [rows] = await pool.query(sql, [hoyISO, hoyISO]);
  return rows;
};

// 📧 Correos pendientes (aún no registrados en tbl_notificaciones_enviadas) por módulo
export const getPendingEmailsForPromo = async (notificacionId, moduloId) => {
  if (moduloId === 1) {
    // Expedientes: campo de email = 'email'
    const sql = `
      SELECT DISTINCT LOWER(TRIM(e.email)) AS correo
      FROM tbl_expedientes e
      LEFT JOIN tbl_notificaciones_enviadas ne
        ON ne.correo_destino = LOWER(TRIM(e.email))
       AND ne.fk_id_notificacion = ?
      WHERE e.email IS NOT NULL
        AND e.email <> ''
        AND ne.pk_id_envio IS NULL
    `;
    const [rows] = await pool.query(sql, [notificacionId]);
    return rows.map(r => r.correo);
  }

  if (moduloId === 2) {
    // Órdenes: campo de email = 'correo'
    const sql = `
      SELECT DISTINCT LOWER(TRIM(o.correo)) AS correo
      FROM tbl_ordenes o
      LEFT JOIN tbl_notificaciones_enviadas ne
        ON ne.correo_destino = LOWER(TRIM(o.correo))
       AND ne.fk_id_notificacion = ?
      WHERE o.correo IS NOT NULL
        AND o.correo <> ''
        AND ne.pk_id_envio IS NULL
    `;
    const [rows] = await pool.query(sql, [notificacionId]);
    return rows.map(r => r.correo);
  }

  // Si aparece otro módulo (por compatibilidad futura)
  return [];
};

// 🔁 Obtener notificaciones activas tipo RECORDATORIO (no promociones)
export const getRecordatoriosActivos = async () => {
  const query = `
    SELECT *
    FROM tbl_notificaciones
    WHERE fk_id_categoria_notificacion != 2
      AND fk_id_estado_notificacion = 1
      AND fk_id_tipo_notificacion = 1
      AND enviar_email = 1
  `;
  const [rows] = await pool.query(query);
  return rows;
};

// 🧾 Obtener expedientes y sus correos válidos
export const getExpedientes = async () => {
  const query = `
    SELECT pk_id_expediente AS id, email AS correo, fecha_registro
    FROM tbl_expedientes
    WHERE email IS NOT NULL AND email != ''
  `;
  const [rows] = await pool.query(query);
  return rows;
};

// 🧾 Obtener órdenes con sus fechas clave y correos
export const getOrdenes = async () => {
  const query = `
    SELECT pk_id_orden AS id, correo, fecha_recepcion, fecha_entrega
    FROM tbl_ordenes
    WHERE correo IS NOT NULL AND correo != ''
  `;
  const [rows] = await pool.query(query);
  return rows;
};

// 📨 Registrar envío en la tabla tbl_notificaciones_enviadas
export const registrarEnvio = async (idNotificacion, correo) => {
  const query = `
    INSERT IGNORE INTO tbl_notificaciones_enviadas (fk_id_notificacion, correo_destino)
    VALUES (?, ?)
  `;
  await pool.query(query, [idNotificacion, correo]);
};

// 📅 Obtener correos de recordatorios según módulo y tipo_intervalo
export const getCorreosRecordatorioPorNotificacion = async (noti) => {
  if (noti.fk_id_modulo_notificacion === 1) {
    // 🩺 EXPEDIENTES → después de registro
    const sql = `
      SELECT LOWER(TRIM(email)) AS correo
      FROM tbl_expedientes
      WHERE email IS NOT NULL AND email <> ''
        AND DATE_ADD(fecha_registro, INTERVAL ? DAY) = CURDATE()
    `;
    const [rows] = await pool.query(sql, [noti.intervalo_dias]);
    return rows.map((r) => r.correo);
  }

  if (noti.fk_id_modulo_notificacion === 2) {
    // 📦 ÓRDENES → después de recepción o antes de entrega
    let sql = "";
    if (noti.tipo_intervalo === "despues_recepcion") {
      sql = `
        SELECT LOWER(TRIM(correo)) AS correo
        FROM tbl_ordenes
        WHERE correo IS NOT NULL AND correo <> ''
          AND DATE_ADD(fecha_recepcion, INTERVAL ? DAY) = CURDATE()
      `;
    } else if (noti.tipo_intervalo === "antes_entrega") {
      sql = `
        SELECT LOWER(TRIM(correo)) AS correo
        FROM tbl_ordenes
        WHERE correo IS NOT NULL AND correo <> ''
          AND DATE_SUB(fecha_entrega, INTERVAL ? DAY) = CURDATE()
      `;
    }
    const [rows] = await pool.query(sql, [noti.intervalo_dias]);
    return rows.map((r) => r.correo);
  }

  return [];
};

