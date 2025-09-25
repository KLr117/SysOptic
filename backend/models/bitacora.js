// models/bitacora.js
import pool from "../database/db.js";

export const getBitacora = async () => {
  const [rows] = await pool.query(`
    SELECT 
      b.pk_id_bitacora,
      u.username AS usuario_accion,
      b.accion,
      b.fecha_accion,
      u2.username AS usuario_objetivo,
      b.fk_id_expediente,
      b.fk_id_orden,
      b.fk_id_notificacion
    FROM tbl_bitacora b
    JOIN tbl_users u ON b.fk_id_user = u.pk_id_user
    LEFT JOIN tbl_users u2 ON b.fk_id_user_objetivo = u2.pk_id_user
    ORDER BY b.fecha_accion DESC;
  `);
  return rows;
};
