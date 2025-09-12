import express from "express";
import cors from "cors";
import pool from "../database/db.js";
import bcrypt from "bcrypt";
import { authMiddleware } from "../middlewares/Auth.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Endpoint para verificar la conexión a la base de datos
app.get("/api/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({ ok: true, db: "connected", result: rows[0].result });
  } catch (error) {
    console.error("❌ Error en conexión DB:", error);
    res.status(500).json({ ok: false, db: "error", error: error.message });
  }
});

// Endpoint de login
// Login con bcrypt
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ ok: false, message: "Usuario y contraseña requeridos" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tbl_users WHERE username = ?",
      [username]
    );

    if (rows.length === 0)
      return res.status(401).json({ ok: false, message: "Usuario no encontrado" });

    const user = rows[0];

    // 🔒 Validar contraseña con bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ ok: false, message: "Contraseña incorrecta" });

    // Login correcto
    return res.json({
      ok: true,
      message: "Login exitoso",
      user: {
        id: user.pk_id_user,
        username: user.username,
        role: user.fk_id_role
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
});

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

