import pool from "../database/db.js";

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM tbl_users WHERE username = ?", [username]);
  return rows[0];
};
