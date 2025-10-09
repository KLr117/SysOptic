import pool from "../database/db.js";

// 🔍 Buscar usuario por username (para login)
export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT 
        u.pk_id_user,
        u.first_name,
        u.last_name,
        u.username,
        u.password,
        u.fk_id_role,
        r.nombre_role
     FROM tbl_users u
     JOIN tbl_roles r ON r.pk_id_role = u.fk_id_role
     WHERE u.username = ?`,
    [username]
  );
  return rows[0];
};

// 🔍 Buscar usuario por ID (para /me)
export const getUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
        u.pk_id_user,
        u.first_name,
        u.last_name,
        u.username,
        u.fk_id_role,
        r.nombre_role
     FROM tbl_users u
     JOIN tbl_roles r ON r.pk_id_role = u.fk_id_role
     WHERE u.pk_id_user = ?`,
    [id]
  );
  return rows[0];
};

// ✅ Verificar si existe username
export const usernameExists = async (username) => {
  const [rows] = await pool.query(
    "SELECT pk_id_user FROM tbl_users WHERE username = ?",
    [username]
  );
  return rows.length > 0;
};

// 👤 Crear usuario nuevo
export const createUser = async (firstName, lastName, username, hashedPassword, roleId) => {
  const [result] = await pool.query(
    `INSERT INTO tbl_users (first_name, last_name, username, password, fk_id_role)
     VALUES (?, ?, ?, ?, ?)`,
    [firstName, lastName, username, hashedPassword, roleId]
  );
  return result.insertId;
};

// 🧾 Registrar acción en bitácora
export const addBitacoraEntry = async (userId, action, targetUserId = null) => {
  await pool.query(
    `INSERT INTO tbl_bitacora (fk_id_user, accion, fk_id_user_objetivo)
     VALUES (?, ?, ?)`,
    [userId, action, targetUserId]
  );
};
