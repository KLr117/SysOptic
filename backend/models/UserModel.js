import pool from "../database/db.js";

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM tbl_users WHERE username = ?", [username]);
  return rows[0];
};

export const createUser = async (firstName, lastName, username, hashedPassword, role) => {
  const [result] = await pool.query(
    "INSERT INTO tbl_users (firstName, lastName, username, password, fk_id_role) VALUES (?, ?, ?, ?, ?)",
    [firstName, lastName, username, hashedPassword, role]
  );
  return result.insertId;
};

export const addBitacoraEntry = async (userId, action, targetUserId = null) => {
  await pool.query(
    "INSERT INTO tbl_bitacora (fk_id_user, accion, fk_id_user_objetivo) VALUES (?, ?, ?)",
    [userId, action, targetUserId]
  );
};