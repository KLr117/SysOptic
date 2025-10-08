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
      fecha_registro,
      fotos
    FROM tbl_expedientes
    ORDER BY fecha_registro DESC
  `);
  
  // Procesar las fotos (si están almacenadas como JSON)
  return rows.map(expediente => ({
    ...expediente,
    foto: expediente.fotos ? JSON.parse(expediente.fotos) : []
  }));
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
      fecha_registro,
      fotos
    FROM tbl_expedientes
    WHERE pk_id_expediente = ?
  `, [id]);
  
  if (rows[0]) {
    return {
      ...rows[0],
      foto: rows[0].fotos ? JSON.parse(rows[0].fotos) : []
    };
  }
  return null;
};

// Crear nuevo expediente (SIN FOTOS por ahora)
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
    (correlativo, nombre, telefono, direccion, email, fecha_registro, fotos)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    correlativoGenerado, nombre, telefono, direccion, email, fecha_registro, false
  ]);

  return result.insertId;
};

// Actualizar expediente (SIN FOTOS por ahora)
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