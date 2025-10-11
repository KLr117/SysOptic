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
  
  // Procesar las fotos (si están almacenadas como JSON) y determinar si tiene imágenes
  return rows.map(expediente => {
    let fotosArray = [];
    let tieneImagenes = false;
    
    if (expediente.fotos) {
      try {
        fotosArray = JSON.parse(expediente.fotos);
        tieneImagenes = Array.isArray(fotosArray) && fotosArray.length > 0;
      } catch (error) {
        console.error('Error parsing fotos JSON:', error);
        fotosArray = [];
        tieneImagenes = false;
      }
    }
    
    return {
      ...expediente,
      foto: fotosArray,
      imagenes: tieneImagenes
    };
  });
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
    let fotosArray = [];
    let tieneImagenes = false;
    
    if (rows[0].fotos) {
      try {
        fotosArray = JSON.parse(rows[0].fotos);
        tieneImagenes = Array.isArray(fotosArray) && fotosArray.length > 0;
      } catch (error) {
        console.error('Error parsing fotos JSON:', error);
        fotosArray = [];
        tieneImagenes = false;
      }
    }
    
    return {
      ...rows[0],
      foto: fotosArray,
      imagenes: tieneImagenes
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
    fecha_registro,
    fotos
  } = expedienteData;

  const correlativoGenerado = correlativo || `EXP-${Date.now()}`;

  // Procesar las fotos - convertir array a JSON string
  const fotosJson = Array.isArray(fotos) ? JSON.stringify(fotos) : JSON.stringify([]);

  console.log('=== CREANDO EXPEDIENTE ===');
  console.log('Correlativo:', correlativoGenerado);
  console.log('Nombre:', nombre);
  console.log('Fotos recibidas:', fotos);
  console.log('Fotos JSON:', fotosJson);
  console.log('==========================');

  const [result] = await pool.query(`
    INSERT INTO tbl_expedientes 
    (correlativo, nombre, telefono, direccion, email, fecha_registro, fotos)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    correlativoGenerado, nombre, telefono, direccion, email, fecha_registro, fotosJson
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
    fecha_registro,
    fotos
  } = expedienteData;

  // Procesar las fotos - convertir array a JSON string
  const fotosJson = Array.isArray(fotos) ? JSON.stringify(fotos) : JSON.stringify([]);

  const [result] = await pool.query(`
    UPDATE tbl_expedientes 
    SET correlativo = ?, nombre = ?, telefono = ?, direccion = ?,
        email = ?, fecha_registro = ?, fotos = ?
    WHERE pk_id_expediente = ?
  `, [
    correlativo, nombre, telefono, direccion, email, fecha_registro, fotosJson, id
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

// Actualizar campo imagenes en expediente
export const updateImagenesExpediente = async (expedienteId, tieneImagenes) => {
  const [result] = await pool.query(`
    UPDATE tbl_expedientes 
    SET imagenes = ? 
    WHERE pk_id_expediente = ?
  `, [tieneImagenes, expedienteId]);
  
  return result.affectedRows > 0;
};