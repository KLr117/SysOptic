import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/ping-hostinger", async (req, res) => {
  try {
    // 1️⃣ Obtener IP pública del servidor Render
    const ipResponse = await axios.get("https://api64.ipify.org?format=json");
    const renderIP = ipResponse.data.ip;

    // 2️⃣ Hacer el ping a tu hosting (forzará log en Hostinger)
    const target = "https://lightsteelblue-termite-871777.hostingersite.com/does_not_exist";
    await axios.get(target);

    // 3️⃣ Responder con info útil para soporte
    res.json({
      success: true,
      message: "Solicitud enviada — revisa los logs de Hostinger Analytics",
      render_ip: renderIP,
      target,
    });
  } catch (error) {
    console.error("🔍 Error al hacer GET a Hostinger:", error.message);
    res.json({
      success: true,
      message: "Solicitud enviada — revisa los logs de Hostinger Analytics",
      error: error.message,
    });
  }
});

export default router;


