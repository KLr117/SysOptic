import express from "express";
import pool from "../database/db.js";

const router = express.Router();

// Obtener bitácora con nombres de usuarios
router.get("/", async (req, res) => {
  try {
    const query = `
SELECT b.pk_id_bitacora, b.accion, b.fecha_accion,
       u.username AS usuario,
       u2.username AS usuario_objetivo
FROM tbl_bitacora b
LEFT JOIN tbl_users u ON b.fk_id_user = u.pk_id_user
LEFT JOIN tbl_users u2 ON b.fk_id_user_objetivo = u2.pk_id_user
ORDER BY b.fecha_accion DESC

    `;
    const [rows] = await pool.query(query);
    res.json({ ok: true, bitacora: rows });
  } catch (error) {
    console.error("Error al traer bitácora:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;