import express from "express";
import cors from "cors";
import { authMiddleware } from "../middlewares/Auth.js";
import bitacoraRoutes from "../routes/bitacora.js";
import authRoutes from "../routes/AuthRoutes.js";
import systemRoutes from "../routes/SystemRoutes.js";
import ordenTrabajoRoutes from "../routes/OrdenTrabajoRoutes.js";
import expedientesRoutes from "../routes/ExpedientesRoutes.js";
import notificacionesRoutes from "../routes/notificacionesRoutes.js";





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








app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
