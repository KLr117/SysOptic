import pool from "../database/db.js";

export const insertEnviosBatch = async (notificacionId, correos /* array */) => {
  if (!correos || correos.length === 0) return 0;

  // Normalizar por si acaso
  const norm = correos
    .map(c => (c || "").trim().toLowerCase())
    .filter(c => c.length > 0);

  if (norm.length === 0) return 0;

  // INSERT IGNORE respeta tu UNIQUE(fk_id_notificacion, correo_destino)
  const values = norm.map(() => "(?, ?)").join(",");
  const params = norm.flatMap(c => [notificacionId, c]);

  const sql = `
    INSERT IGNORE INTO tbl_notificaciones_enviadas (fk_id_notificacion, correo_destino)
    VALUES ${values}
  `;
  const [result] = await pool.query(sql, params);
  // result.affectedRows ≈ cantidad insertada (los duplicados se ignoran)
  return result.affectedRows || 0;
};
