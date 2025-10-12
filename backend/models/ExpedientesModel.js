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
  
  // Retornar expedientes sin procesar fotos (ahora se manejan por separado)
  return rows.map(expediente => ({
    ...expediente,
    foto: [], // Array vacío - las fotos se cargan por separado
    imagenes: false // Siempre false - las fotos se cargan por separado
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
      foto: [], // Array vacío - las fotos se cargan por separado
      imagenes: false // Siempre false - las fotos se cargan por separado
    };
  }
  return null;
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

  console.log('=== CREANDO EXPEDIENTE ===');
  console.log('Correlativo:', correlativoGenerado);
  console.log('Nombre:', nombre);
  console.log('Teléfono:', telefono);
  console.log('Email:', email);
  console.log('==========================');

  // Insertar expediente sin campo fotos (las imágenes se manejan por separado)
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

  // Actualizar expediente sin campo fotos (las imágenes se manejan por separado)
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

// Obtener el último correlativo para sugerir el siguiente
export const getLastCorrelativoExpediente = async () => {
  const [rows] = await pool.query(`
    SELECT correlativo 
    FROM tbl_expedientes 
    ORDER BY pk_id_expediente DESC 
    LIMIT 1
  `);
  
  if (rows.length > 0) {
    const correlativo = rows[0].correlativo;
    // Extraer solo el número del correlativo (en caso de que tenga formato EXP-001)
    const numero = parseInt(correlativo.replace(/\D/g, '')) || 0;
    return numero;
  }
  
  return 0; // Si no hay expedientes, empezar desde 0
};

