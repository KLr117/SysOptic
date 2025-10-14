import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * ✅ Ruta 1: Confirmar que el backend está vivo
 * URL: https://TU_BACKEND/api/test/ping
 */
router.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Backend activo y respondiendo desde Railway",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 🌐 Ruta 2: Obtener la IP pública del servidor en Railway
 * (para agregar en Hostinger > MySQL remoto)
 * URL: https://TU_BACKEND/api/test/ip
 */
router.get("/ip", async (req, res) => {
  try {
    const response = await axios.get("https://api64.ipify.org?format=json");
    res.json({
      success: true,
      message: "IP pública obtenida exitosamente",
      public_ip: response.data.ip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener IP pública",
      error: error.message,
    });
  }
});

export default router;



