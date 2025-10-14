import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST, // "localhost",
  user: process.env.DB_USER, // "root",
  password: process.env.DB_PASSWORD, // "password",
  database: process.env.DB_NAME, // "Db_name",
  port: process.env.DB_PORT, // 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//  TEST DE CONEXIÓN AUTOMÁTICO 
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conexión MySQL activa desde Render → Hostinger");
    const [rows] = await conn.query("SELECT NOW() AS fecha_actual");
    console.log("🕒 Hora del servidor MySQL:", rows[0].fecha_actual);
    conn.release();
  } catch (err) {
    console.error("❌ Error conectando desde Railway → Hostinger:", err.code || err.message);
  }
})();

export default pool;
