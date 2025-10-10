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
export const createUser = async (
  firstName,
  lastName,
  username,
  hashedPassword,
  roleId
) => {
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

// ✅ Listar usuarios con paginación y búsqueda
export const listUsers = async ({ page = 1, limit = 10, q = "" } = {}) => {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];

  if (q) {
    where.push(
      `(u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT u.pk_id_user, u.first_name, u.last_name, u.username, u.fk_id_role, u.created_at,
            r.nombre_role
     FROM tbl_users u
     JOIN tbl_roles r ON r.pk_id_role = u.fk_id_role
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM tbl_users u ${whereClause}`,
    params
  );

  return { rows, total: countRows[0].total };
};

// ✅ Obtener usuario por ID incluyendo contraseña (para cambio de password)
export const getUserByIdWithPassword = async (id) => {
  const [rows] = await pool.query(
    `SELECT u.pk_id_user, u.first_name, u.last_name, u.username, u.password, 
            u.fk_id_role, r.nombre_role
     FROM tbl_users u
     JOIN tbl_roles r ON r.pk_id_role = u.fk_id_role
     WHERE u.pk_id_user = ?`,
    [id]
  );
  return rows[0];
};

// ✅ Verificar si el username ya está en uso por otro usuario (para ediciones)
export const usernameExistsOther = async (id, username) => {
  const [rows] = await pool.query(
    `SELECT pk_id_user FROM tbl_users WHERE username = ? AND pk_id_user <> ?`,
    [username, id]
  );
  return rows.length > 0;
};

// ✅ Actualizar datos básicos de usuario (sin cambiar contraseña)
export const updateUser = async (
  id,
  { firstName, lastName, username, roleId }
) => {
  const fields = [];
  const params = [];

  if (firstName !== undefined) {
    fields.push("first_name = ?");
    params.push(firstName);
  }
  if (lastName !== undefined) {
    fields.push("last_name = ?");
    params.push(lastName);
  }
  if (username !== undefined) {
    fields.push("username = ?");
    params.push(username);
  }
  if (roleId !== undefined) {
    fields.push("fk_id_role = ?");
    params.push(roleId);
  }

  if (!fields.length) return 0;

  params.push(id);
  const [result] = await pool.query(
    `UPDATE tbl_users SET ${fields.join(", ")} WHERE pk_id_user = ?`,
    params
  );
  return result.affectedRows;
};

// ✅ Actualizar contraseña
export const updateUserPassword = async (id, hashedPassword) => {
  const [result] = await pool.query(
    `UPDATE tbl_users SET password = ? WHERE pk_id_user = ?`,
    [hashedPassword, id]
  );
  return result.affectedRows;
};

// ✅ Verificar si un usuario tiene registros en la bitácora antes de eliminarlo
export const hasBitacoraReferences = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
        (SELECT COUNT(*) FROM tbl_bitacora WHERE fk_id_user = ?) +
        (SELECT COUNT(*) FROM tbl_bitacora WHERE fk_id_user_objetivo = ?) AS refs`,
    [id, id]
  );
  return rows[0].refs > 0;
};

// ✅ Eliminar usuario (solo si no tiene referencias)
export const deleteUser = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM tbl_users WHERE pk_id_user = ?`,
    [id]
  );
  return result.affectedRows;
};
