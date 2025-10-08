import pool from "../database/db.js";

export const getAllOrders = async () => {
  const [rows] = await pool.query(`
    SELECT 
      pk_id_orden,
      correlativo,
      paciente,
      direccion,
      correo,
      telefono,
      fecha_recepcion,
      fecha_entrega,
      total,
      adelanto,
      saldo,
      imagenes
    FROM tbl_ordenes
    ORDER BY fecha_recepcion DESC
  `);
  return rows;
};

export const getOrderById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      pk_id_orden,
      correlativo,
      paciente,
      direccion,
      correo,
      telefono,
      fecha_recepcion,
      fecha_entrega,
      total,
      adelanto,
      saldo,
      imagenes
    FROM tbl_ordenes
    WHERE pk_id_orden = ?
  `, [id]);
  return rows[0];
};

export const createOrder = async (orderData) => {
  const {
    correlativo,
    paciente,
    direccion,
    correo,
    telefono,
    fecha_recepcion,
    fecha_entrega,
    total,
    adelanto,
    saldo,
    imagenes
  } = orderData;

  // Determinar si tiene imágenes
  const tieneImagenes = imagenes && imagenes.length > 0;

  const [result] = await pool.query(`
    INSERT INTO tbl_ordenes 
    (correlativo, paciente, direccion, correo, telefono, fecha_recepcion, fecha_entrega, total, adelanto, saldo, imagenes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    correlativo, paciente, direccion, correo, telefono, fecha_recepcion, fecha_entrega,
    total, adelanto, saldo, tieneImagenes
  ]);

  return result.insertId;
};

// Actualizar campo imagenes
export const updateImagenes = async (ordenId, tieneImagenes) => {
  const [result] = await pool.query(`
    UPDATE tbl_ordenes 
    SET imagenes = ? 
    WHERE pk_id_orden = ?
  `, [tieneImagenes, ordenId]);
  
  return result.affectedRows > 0;
};


export const updateOrder = async (id, orderData) => {
  const {
    paciente,
    direccion,
    correo,
    telefono,
    fecha_recepcion,
    fecha_entrega,
    total,
    adelanto,
    saldo
  } = orderData;

  const [result] = await pool.query(`
    UPDATE tbl_ordenes 
    SET paciente = ?, direccion = ?, correo = ?, telefono = ?, 
        fecha_recepcion = ?, fecha_entrega = ?, total = ?, adelanto = ?, 
        saldo = ?
    WHERE pk_id_orden = ?
  `, [
    paciente, direccion, correo, telefono, fecha_recepcion, fecha_entrega,
    total, adelanto, saldo, id
  ]);

  return result.affectedRows > 0;
};

export const deleteOrder = async (id) => {
  const [result] = await pool.query(`
    DELETE FROM tbl_ordenes WHERE pk_id_orden = ?
  `, [id]);

  return result.affectedRows > 0;
};
