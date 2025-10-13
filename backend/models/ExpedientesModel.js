import pool from "../database/db.js";

// Obtener todos los expedientes con información de imágenes
export const getAllExpedientes = async () => {
  const [rows] = await pool.query(`
    SELECT 
      e.pk_id_expediente,
      e.correlativo,
      e.nombre,
      e.telefono,
      e.direccion,
      e.email,
      e.fecha_registro,
      e.fotos,
      COUNT(i.id) as total_imagenes
    FROM tbl_expedientes e
    LEFT JOIN tbl_imagenes_expedientes i ON e.pk_id_expediente = i.expediente_id
    GROUP BY e.pk_id_expediente
    ORDER BY e.fecha_registro DESC
  `);
  
  // Obtener imágenes por separado para cada expediente
  const expedientesConImagenes = await Promise.all(
    rows.map(async (expediente) => {
      try {
        const [imagenesRows] = await pool.query(`
          SELECT id, ruta_archivo, nombre_archivo
          FROM tbl_imagenes_expedientes
          WHERE expediente_id = ?
        `, [expediente.pk_id_expediente]);
        
        const imagenes = imagenesRows.map(img => {
          // Generar URL completa para acceso directo
          const baseUrl = process.env.API_URL || 'http://localhost:4000';
          return `${baseUrl}${img.ruta_archivo}`;
        });
        
        return {
          ...expediente,
          foto: imagenes, // Array de URLs
          imagenes: expediente.fotos && expediente.fotos.trim() !== '', // Validar si hay contenido en fotos
          total_imagenes: parseInt(expediente.total_imagenes) || 0
        };
      } catch (error) {
        console.error(`Error cargando imágenes para expediente ${expediente.pk_id_expediente}:`, error);
        return {
          ...expediente,
          foto: [], // Array vacío si hay error
          imagenes: false,
          total_imagenes: 0
        };
      }
    })
  );
  
  return expedientesConImagenes;
};

// Obtener expediente por ID con información de imágenes
export const getExpedienteById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      e.pk_id_expediente,
      e.correlativo,
      e.nombre,
      e.telefono,
      e.direccion,
      e.email,
      e.fecha_registro,
      e.fotos,
      COUNT(i.id) as total_imagenes
    FROM tbl_expedientes e
    LEFT JOIN tbl_imagenes_expedientes i ON e.pk_id_expediente = i.expediente_id
    WHERE e.pk_id_expediente = ?
    GROUP BY e.pk_id_expediente
  `, [id]);
  
  if (rows[0]) {
    try {
      const [imagenesRows] = await pool.query(`
        SELECT id, ruta_archivo, nombre_archivo
        FROM tbl_imagenes_expedientes
        WHERE expediente_id = ?
      `, [id]);
      
      const imagenes = imagenesRows.map(img => {
        // Generar URL completa para acceso directo
        const baseUrl = process.env.API_URL || 'http://localhost:4000';
        return `${baseUrl}${img.ruta_archivo}`;
      });
      
      return {
        ...rows[0],
        foto: imagenes, // Array de URLs
        imagenes: rows[0].fotos && rows[0].fotos.trim() !== '', // Validar si hay contenido en fotos
        total_imagenes: parseInt(rows[0].total_imagenes) || 0
      };
    } catch (error) {
      console.error(`Error cargando imágenes para expediente ${id}:`, error);
      return {
        ...rows[0],
        foto: [], // Array vacío si hay error
        imagenes: false,
        total_imagenes: 0
      };
    }
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

  const [result] = await pool.query(`
    INSERT INTO tbl_expedientes 
    (correlativo, nombre, telefono, direccion, email, fecha_registro, fotos)
    VALUES (?, ?, ?, ?, ?, ?, '')
  `, [
    correlativoGenerado, nombre, telefono, direccion, email, fecha_registro
  ]);

  return result.insertId;
};

// Actualizar expediente
export const updateExpediente = async (id, expedienteData) => {
  try {
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
  } catch (error) {
    console.error('❌ Error en updateExpediente:', error);
    throw error;
  }
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

// Actualizar campo fotos en expediente
export const updateFotosExpediente = async (expedienteId, tieneImagenes) => {
  try {
    const valorFotos = tieneImagenes ? 'SI' : ''; // Usar 'SI' si tiene imágenes, vacío si no
    const [result] = await pool.query(`
      UPDATE tbl_expedientes 
      SET fotos = ? 
      WHERE pk_id_expediente = ?
    `, [valorFotos, expedienteId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en updateFotosExpediente:', error);
    throw error;
  }
};