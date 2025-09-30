import pool from "../database/db.js";

// Obtener todos los expedientes
export const getAllExpedientes = async () => {
  const [rows] = await pool.query(`
    SELECT 
      pk_id_expediente,
      correlativo,
      nombre,
      telefono,
      direccion,
      email,
      fecha_registro
    FROM tbl_expedientes
    ORDER BY fecha_registro DESC
  `);
  return rows;
};

// Obtener expediente por ID
export const getExpedienteById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      pk_id_expediente,
      correlativo,
      nombre,
      telefono,
      direccion,
      email,
      fecha_registro
    FROM tbl_expedientes
    WHERE pk_id_expediente = ?
  `, [id]);
  return rows[0];
};

// Crear nuevo expediente
export const createExpediente = async (expedienteData) => {
  const {
    correlativo,
    nombre,
    telefono,
    direccion,
    email,
    fecha_registro 
  } = expedienteData;

  const correlativoGenerado = correlativo || `EXP-${Date.now()}`;

  const [result] = await pool.query(`
    INSERT INTO tbl_expedientes 
    (correlativo, nombre, telefono, direccion, email, fecha_registro)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    correlativoGenerado, nombre, telefono, direccion, email, fecha_registro
  ]);

  return result.insertId;
};

// Actualizar expediente
export const updateExpediente = async (id, expedienteData) => {
  const {
    correlativo,
    nombre,
    telefono,
    direccion,
    email,
    fecha_registro
  } = expedienteData;

  const [result] = await pool.query(`
    UPDATE tbl_expedientes 
    SET correlativo = ?, nombre = ?, telefono = ?, direccion = ?,
        email = ?, fecha_registro = ?
    WHERE pk_id_expediente = ?
  `, [
    correlativo, nombre, telefono, direccion, email, fecha_registro, id
  ]);

  return result.affectedRows > 0;
};

// Eliminar expediente
export const deleteExpediente = async (id) => {
  const [result] = await pool.query(`
    DELETE FROM tbl_expedientes WHERE pk_id_expediente = ?
  `, [id]);

  return result.affectedRows > 0;
};
