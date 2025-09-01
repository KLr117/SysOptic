import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Endpoint simple para comprobar que todo funciona
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "sysoptic-backend", time: new Date().toISOString() });
});

// Datos dummy para el dashboard
app.get("/api/stats", (req, res) => {
  res.json({
    expedientes: 183,
    ordenes: 312,
    pendientesEntrega: 7,
    notificaciones: 4
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});

