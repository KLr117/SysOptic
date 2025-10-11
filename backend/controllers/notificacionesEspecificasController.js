import pool from "../database/db.js";

// ==============================
// 📩 CREAR NOTIFICACIÓN ESPECÍFICA
// ==============================
export const crearNotificacionEspecificaExpediente = async (req, res) => {
  const { expedienteId } = req.params;
  const {
    titulo,
    descripcion,
    intervalo_dias,
    enviar_email,
    asunto_email,
    cuerpo_email,
    fk_id_categoria_notificacion,
    fecha_objetivo,
    fecha_fin,
  } = req.body;

  try {
    const query = `
      INSERT INTO tbl_notificaciones (
        titulo, descripcion, fk_id_tipo_notificacion, fk_id_categoria_notificacion,
        fk_id_modulo_notificacion, fk_id_estado_notificacion, fk_id_expediente,
        intervalo_dias, tipo_intervalo, enviar_email, asunto_email, cuerpo_email,
        fecha_objetivo, fecha_fin
      )
      VALUES (?, ?, 2, ?, 1, 1, ?, ?, 'despues_registro', ?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [
      titulo,
      descripcion,
      fk_id_categoria_notificacion || 1,
      expedienteId,
      intervalo_dias,
      enviar_email,
      asunto_email,
      cuerpo_email,
      fecha_objetivo || null,
      fecha_fin || null,
    ]);
    res.json({
      ok: true,
      message: "Notificación específica creada correctamente",
    });
  } catch (error) {
    console.error("Error creando notificación específica:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al crear notificación específica" });
  }
};

export const crearNotificacionEspecificaOrden = async (req, res) => {
  const { ordenId } = req.params;
  const {
    titulo,
    descripcion,
    intervalo_dias,
    tipo_intervalo,
    enviar_email,
    asunto_email,
    cuerpo_email,
    fk_id_categoria_notificacion,
    fecha_objetivo,
    fecha_fin,
  } = req.body;

  try {
    const query = `
      INSERT INTO tbl_notificaciones (
        titulo, descripcion, fk_id_tipo_notificacion, fk_id_categoria_notificacion,
        fk_id_modulo_notificacion, fk_id_estado_notificacion, fk_id_orden,
        intervalo_dias, tipo_intervalo, enviar_email, asunto_email, cuerpo_email,
        fecha_objetivo, fecha_fin
      )
      VALUES (?, ?, 2, ?, 2, 1, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [
      titulo,
      descripcion,
      fk_id_categoria_notificacion || 1,
      ordenId,
      intervalo_dias,
      tipo_intervalo,
      enviar_email,
      asunto_email,
      cuerpo_email,
      fecha_objetivo || null,
      fecha_fin || null,
    ]);
    res.json({
      ok: true,
      message: "Notificación específica creada correctamente",
    });
  } catch (error) {
    console.error("Error creando notificación específica:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al crear notificación específica" });
  }
};

// ==============================
// 📋 OBTENER NOTIFICACIÓN ESPECÍFICA
// ==============================
export const obtenerNotificacionPorExpediente = async (req, res) => {
  const { expedienteId } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM tbl_notificaciones WHERE fk_id_expediente = ? LIMIT 1",
      [expedienteId]
    );
    if (rows.length === 0) {
      return res.json({ ok: true, notificacion: null });
    }
    res.json({ ok: true, notificacion: rows[0] });
  } catch (error) {
    console.error("Error obteniendo notificación específica:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener notificación específica" });
  }
};

export const obtenerNotificacionPorOrden = async (req, res) => {
  const { ordenId } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM tbl_notificaciones WHERE fk_id_orden = ? LIMIT 1",
      [ordenId]
    );
    if (rows.length === 0) {
      return res.json({ ok: true, notificacion: null });
    }
    res.json({ ok: true, notificacion: rows[0] });
  } catch (error) {
    console.error("Error obteniendo notificación específica:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener notificación específica" });
  }
};

// Obtener notificación específica por ID (para editar/ver)
export const obtenerNotificacionEspecificaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM tbl_notificaciones WHERE pk_id_notificacion = ? AND (fk_id_expediente IS NOT NULL OR fk_id_orden IS NOT NULL) LIMIT 1",
      [id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Notificación no encontrada" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo notificación específica por ID:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener notificación específica" });
  }
};

// ==============================
// ✏️ EDITAR NOTIFICACIÓN ESPECÍFICA
// ==============================
export const editarNotificacionEspecifica = async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    intervalo_dias,
    tipo_intervalo,
    enviar_email,
    asunto_email,
    cuerpo_email,
    fk_id_categoria_notificacion,
    fecha_objetivo,
    fecha_fin,
  } = req.body;

  try {
    await pool.execute(
      `UPDATE tbl_notificaciones
       SET titulo = ?, descripcion = ?, fk_id_categoria_notificacion = ?, 
           intervalo_dias = ?, tipo_intervalo = ?, enviar_email = ?, 
           asunto_email = ?, cuerpo_email = ?, fecha_objetivo = ?, fecha_fin = ?
       WHERE pk_id_notificacion = ?`,
      [
        titulo,
        descripcion,
        fk_id_categoria_notificacion || 1,
        intervalo_dias,
        tipo_intervalo,
        enviar_email,
        asunto_email,
        cuerpo_email,
        fecha_objetivo || null,
        fecha_fin || null,
        id,
      ]
    );
    res.json({
      ok: true,
      message: "Notificación específica actualizada correctamente",
    });
  } catch (error) {
    console.error("Error actualizando notificación específica:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al actualizar notificación" });
  }
};

// ==============================
// 🗑️ ELIMINAR NOTIFICACIÓN ESPECÍFICA
// ==============================
export const eliminarNotificacionEspecifica = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute(
      "DELETE FROM tbl_notificaciones WHERE pk_id_notificacion = ?",
      [id]
    );
    res.json({
      ok: true,
      message: "Notificación específica eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando notificación específica:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al eliminar notificación" });
  }
};

// ==============================
// ✅ ENDPOINT OPTIMIZADO DE ESTADO
// ==============================
export const obtenerEstadoNotificacionExpediente = async (req, res) => {
  const { expedienteId } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT pk_id_notificacion AS id, titulo, fk_id_estado_notificacion AS estado_id
       FROM tbl_notificaciones WHERE fk_id_expediente = ? LIMIT 1`,
      [expedienteId]
    );

    if (rows.length === 0) {
      return res.json({ ok: true, tieneNotificacion: false, estado: null });
    }

    const estado = rows[0].estado_id === 1 ? "activa" : "inactiva";
    res.json({
      ok: true,
      tieneNotificacion: true,
      estado,
      id: rows[0].id,
      titulo: rows[0].titulo,
    });
  } catch (error) {
    console.error("Error obteniendo estado de notificación:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener estado de notificación" });
  }
};

export const obtenerEstadoNotificacionOrden = async (req, res) => {
  const { ordenId } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT pk_id_notificacion AS id, titulo, fk_id_estado_notificacion AS estado_id
       FROM tbl_notificaciones WHERE fk_id_orden = ? LIMIT 1`,
      [ordenId]
    );

    if (rows.length === 0) {
      return res.json({ ok: true, tieneNotificacion: false, estado: null });
    }

    const estado = rows[0].estado_id === 1 ? "activa" : "inactiva";
    res.json({
      ok: true,
      tieneNotificacion: true,
      estado,
      id: rows[0].id,
      titulo: rows[0].titulo,
    });
  } catch (error) {
    console.error("Error obteniendo estado de notificación:", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al obtener estado de notificación" });
  }
};
