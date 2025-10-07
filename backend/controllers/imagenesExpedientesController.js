import db from '../database/db.js';
import ImagenesOrdenesModel from '../models/imagenesOrdenesModel.js';
import { updateImagenes } from '../models/OrdenTrabajoModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Actualiza el campo imagenes en la tabla tbl_expedientes
 * @param {number} expedienteId - ID del expediente
 * @param {boolean} tieneImagenes - true si tiene imágenes, false si no
 */
export const updateImagenesExpediente = async (expedienteId, tieneImagenes) => {
  try {
    const query = `
      UPDATE tbl_expedientes 
      SET imagenes = ? 
      WHERE pk_id_expediente = ?
    `;
    
    const [result] = await db.execute(query, [tieneImagenes, expedienteId]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error actualizando campo imagenes del expediente:', error);
    return { success: false, error: error.message };
  }
};