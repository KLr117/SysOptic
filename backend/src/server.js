import express from "express";
import cors from "cors";
import cron from "node-cron";
import authRoutes from "../routes/AuthRoutes.js";
import bitacoraRoutes from "../routes/bitacora.js";
import systemRoutes from "../routes/SystemRoutes.js";
import ordenTrabajoRoutes from "../routes/OrdenTrabajoRoutes.js";
import expedientesRoutes from "../routes/ExpedientesRoutes.js";
import notificacionesRoutes from "../routes/notificacionesRoutes.js";
import imagenesOrdenesRoutes from "../routes/imagenesOrdenesRoutes.js";
import mailTestRoutes from "../routes/mailTestRoutes.js";
import usersRoutes from "../routes/UsersRoutes.js";
import { authMiddleware } from "../middlewares/Auth.js";

import {
  procesarPromocionesActivas,
  procesarRecordatoriosActivos,
} from "../controllers/notificacionesController.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ======================
// 🌐 Rutas públicas
// ======================
app.use("/api", authRoutes);
app.use("/api/mail", mailTestRoutes);

// ======================
// 🔒 Middleware global de autenticación JWT (excepto imágenes-ordenes públicas)
// ======================
app.use((req, res, next) => {
  // Permitir acceso público solo a imágenes servidas directamente
  const publicImageRoutes = [
    /^\/api\/imagenes-ordenes\/servir/,
  ];

  const isPublic = publicImageRoutes.some((pattern) => pattern.test(req.path));
  if (isPublic) return next(); // ⚠️ No requiere token

  // Para todo lo demás, aplicar autenticación normal
  return authMiddleware(req, res, next);
});

// ======================
// 🔐 Rutas protegidas
// ======================
app.use("/api/bitacora", bitacoraRoutes);
app.use("/api", systemRoutes);
app.use("/api/ordenes", ordenTrabajoRoutes);
app.use("/api/expedientes", expedientesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/imagenes-ordenes", imagenesOrdenesRoutes);
app.use("/api/users", usersRoutes);

// ======================
// 📁 Archivos estáticos
// ======================
app.use("/uploads", express.static("uploads"));
app.use("/public", express.static("public"));

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);

  
  // ==========================
  // 🕒 CRON DE PROMOCIONES SYSOPTIC
  // ==========================

  // Cron configurado para ejecutarse a las 6:00am, 12:00pm y 6:00pm todos los días
  cron.schedule("0 6,12,18 * * *", async () => {
    //PARA PRUEBAS: "* * * * *" PARA EJECUTAR CADA MINUTO, LUEGO CAMBIAR A "0 6,12,18 * * *"
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
