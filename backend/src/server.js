import express from "express";
import cors from "cors";
import cron from "node-cron";
import { authMiddleware } from "../middlewares/Auth.js";
import bitacoraRoutes from "../routes/bitacora.js";
import authRoutes from "../routes/AuthRoutes.js";
import systemRoutes from "../routes/SystemRoutes.js";
import ordenTrabajoRoutes from "../routes/OrdenTrabajoRoutes.js";
import expedientesRoutes from "../routes/ExpedientesRoutes.js";
import notificacionesRoutes from "../routes/notificacionesRoutes.js";
import imagenesOrdenesRoutes from "../routes/imagenesOrdenesRoutes.js";
import { procesarPromocionesActivas, procesarRecordatoriosActivos } from "../controllers/notificacionesController.js";
import mailTestRoutes from "../routes/mailTestRoutes.js";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Registrar rutas
app.use("/api", systemRoutes);
app.use("/api", authRoutes);
app.use("/api/bitacora", bitacoraRoutes);
app.use("/api/ordenes", ordenTrabajoRoutes);
app.use("/api/expedientes", expedientesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/imagenes-ordenes", imagenesOrdenesRoutes);
// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'));
app.use("/public", express.static("public"));
app.use("/api/mail", mailTestRoutes);





app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);

  // ==========================
  // 🕒 CRON DE PROMOCIONES SYSOPTIC
  // ==========================

  // Cron configurado para ejecutarse a las 6:00am, 12:00pm y 6:00pm todos los días
  cron.schedule("0 6,12,18 * * *", async () => {   //PARA PRUEBAS: "* * * * *" PARA EJECUTAR CADA MINUTO, LUEGO CAMBIAR A "0 6,12,18 * * *"
    console.log("⏰ [CRON SYSOPTIC] Ejecutando cron de notificaciones...");
  // === BLOQUE 1: Promociones ===
    try {
      const resultadoPromo = await procesarPromocionesActivas();
      console.log(
        `✅ [CRON SYSOPTIC] ${new Date().toLocaleString()} | Promociones procesadas: ${
          resultadoPromo?.total_enviadas_registradas ?? 0
        }`
      );
    } catch (error) {
      console.error(
        `❌ [CRON SYSOPTIC] ${new Date().toLocaleString()} | Error en promociones:`,
        error.message
      );
    }

    // === BLOQUE 2: Recordatorios ===
    try {
      const resultadoRec = await procesarRecordatoriosActivos();
      console.log(
        `✅ [CRON SYSOPTIC] ${new Date().toLocaleString()} | Recordatorios procesados: ${
          resultadoRec?.total_insertados ?? 0
        }`
      );
    } catch (error) {
      console.error(
        `❌ [CRON SYSOPTIC] ${new Date().toLocaleString()} | Error en recordatorios:`,
        error.message
      );
    }

    console.log("🏁 [CRON SYSOPTIC] Ciclo de notificaciones completado.\n");
    }); 
  });
