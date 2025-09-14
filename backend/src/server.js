import express from "express";
import cors from "cors";
import pool from "../database/db.js";
import bcrypt from "bcrypt";
import { authMiddleware } from "../middlewares/Auth.js";
// import bitacoraRoutes from "../routes/bitacora.js"; // opcional si usas rutas separadas

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

    // ✅ Registrar inicio de sesión en bitácora
    await pool.query(
      "INSERT INTO tbl_bitacora (fk_id_user, accion) VALUES (?, ?)",
      [user.pk_id_user, "Inicio de sesión"]
    );

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

// ✅ Endpoint para obtener la bitácora
app.get("/api/bitacora", async (req, res) => {
  try {
    const query = `
      SELECT 
        b.pk_id_bitacora, 
        b.accion, 
        b.fecha_accion,
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

// Opcional: endpoint para crear usuarios y registrar acción en bitácora
app.post("/api/users", async (req, res) => {
  const { firstName, lastName, username, password, role, fk_id_user } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO tbl_users (firstName, lastName, username, password, fk_id_role) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, username, hashedPassword, role]
    );

    const nuevoUsuarioId = result.insertId;

    // Registrar acción en bitácora
    await pool.query(
      "INSERT INTO tbl_bitacora (fk_id_user, accion, fk_id_user_objetivo) VALUES (?, ?, ?)",
      [fk_id_user, `Creó usuario ${username}`, nuevoUsuarioId]
    );

    res.json({ ok: true, message: "Usuario creado correctamente", id: nuevoUsuarioId });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
