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
import imagenesExpedientesRoutes from "../routes/imagenesExpedientesRoutes.js";
import mailTestRoutes from "../routes/mailTestRoutes.js";
import usersRoutes from "../routes/UsersRoutes.js";
import { authMiddleware } from "../middlewares/Auth.js";
import { logBitacoraMiddleware } from "../middlewares/bitacoraLogger.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import testRoutes from "../routes/testRoutes.js";

import {
  procesarPromocionesActivas,
  procesarRecordatoriosActivos,
} from "../controllers/notificacionesController.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Configurar zona horaria para Node.js
process.env.TZ = 'America/Guatemala';

app.use(cors());
app.use(express.json());

// === Configuración de rutas absolutas seguras ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// 🌐 Rutas públicas
// ======================
app.use("/api", authRoutes);
app.use("/api/mail", mailTestRoutes);
app.use("/api/test", testRoutes);

// ======================
// 🔒 Middleware global de autenticación JWT (excepto imágenes-ordenes públicas)
// ======================
app.use((req, res, next) => {
  // Permitir acceso público solo a imágenes servidas directamente
  const publicImageRoutes = [
    /^\/api\/imagenes-ordenes\/servir/,
    /^\/api\/imagenes-expedientes\/servir/
  ];

  // Permitir acceso a archivos estáticos de uploads
  if (req.path.startsWith('/uploads/')) {
    return next(); // ⚠️ No requiere token
  }

  const isPublic = publicImageRoutes.some((pattern) => pattern.test(req.path));
  if (isPublic) return next(); // ⚠️ No requiere token

  // Para todo lo demás, aplicar autenticación normal
  return authMiddleware(req, res, next);
});

// ======================
// 📝 Middleware de bitácora automática
// ======================
app.use("/api", logBitacoraMiddleware);

// ======================
// 🔐 Rutas protegidas
// ======================
app.use("/api/bitacora", bitacoraRoutes);
app.use("/api", systemRoutes);
app.use("/api/ordenes", ordenTrabajoRoutes);
app.use("/api/expedientes", expedientesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/imagenes-ordenes", imagenesOrdenesRoutes);
app.use("/api/imagenes-expedientes", imagenesExpedientesRoutes);
app.use("/api/users", usersRoutes);

// ======================
// 📁 Archivos estáticos
// ======================
// Crear carpeta uploads si no existe (seguridad en producción)
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/public", express.static(path.join(__dirname, "../public")));


app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT} y escuchando en todas las interfaces`);

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
