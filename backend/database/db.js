import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Función para obtener la fecha actual en zona horaria de Guatemala
export const getGuatemalaTime = () => {
  const now = new Date();
  // Guatemala está en UTC-6
  const guatemalaTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  return guatemalaTime;
};

// Función para formatear fecha a zona horaria de Guatemala
export const formatToGuatemalaTime = (date) => {
  if (!date) return null;
  const guatemalaDate = new Date(date);
  // Ajustar a UTC-6 (Guatemala)
  guatemalaDate.setHours(guatemalaDate.getHours() - 6);
  return guatemalaDate;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST, // "localhost",
  user: process.env.DB_USER, // "root",
  password: process.env.DB_PASSWORD, // "password",
  database: process.env.DB_NAME, // "Db_name",
  port: process.env.DB_PORT, // 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "-06:00", // Zona horaria de Guatemala (GMT-6)
});

//  TEST DE CONEXIÓN AUTOMÁTICO
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conexión MySQL activa desde Railway → Hostinger");
    const [rows] = await conn.query("SELECT NOW() AS fecha_actual");
    console.log("🕒 Hora del servidor MySQL (UTC):", rows[0].fecha_actual);
    console.log("🇬🇹 Hora Guatemala (UTC-6):", getGuatemalaTime().toISOString());
    conn.release();
  } catch (err) {
    console.error(
      "❌ Error conectando desde Railway → Hostinger:",
      err.code || err.message
    );
  }
})();

export default pool;
