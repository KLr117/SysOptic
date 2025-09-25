import pool from "../database/db.js";

export const healthCheck = (req, res) => {
  res.json({ ok: true, service: "sysoptic-backend", time: new Date().toISOString() });
};

export const dbCheck = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({ ok: true, db: "connected", result: rows[0].result });
  } catch (error) {
    console.error("❌ Error en conexión DB:", error);
    res.status(500).json({ ok: false, db: "error", error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    // Contar órdenes reales de la base de datos
    const [ordenesResult] = await pool.query("SELECT COUNT(*) as total FROM tbl_ordenes");
    const ordenesReales = ordenesResult[0].total;

    res.json({
      expedientes: 183, // Mantener valor fijo por ahora
      ordenes: ordenesReales, // Valor real de la base de datos
      pendientesEntrega: 7, // Mantener valor fijo por ahora
      notificaciones: 4 // Mantener valor fijo por ahora
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener estadísticas",
      details: error.message
    });
  }
};
