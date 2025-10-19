/**
 * Utilidades para manejo de fechas con zona horaria de Guatemala (GMT-6)
 */

/**
 * Convierte una fecha en formato YYYY-MM-DD a una fecha con hora de Guatemala
 * Esto evita problemas de desfase de zona horaria al enviar al backend
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha en formato ISO con hora de Guatemala (mediodía para evitar cambios de día)
 */
export const toGuatemalaDateTime = (dateString) => {
  if (!dateString) return null;

  // Crear fecha a mediodía (12:00) en zona horaria de Guatemala para evitar cambios de día
  // Guatemala está en GMT-6, así que agregamos 'T12:00:00-06:00'
  return `${dateString}T12:00:00-06:00`;
};

/**
 * Convierte una fecha ISO del backend a formato YYYY-MM-DD para inputs de tipo date
 * @param {string} isoString - Fecha en formato ISO
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const toInputDate = (isoString) => {
  if (!isoString) return '';

  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para mostrar en la interfaz (DD/MM/YYYY)
 * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Obtiene la fecha actual en zona horaria de Guatemala en formato YYYY-MM-DD
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export const getTodayGuatemala = () => {
  const now = new Date();

  // Convertir a zona horaria de Guatemala (GMT-6)
  const guatemalaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));

  const year = guatemalaTime.getFullYear();
  const month = String(guatemalaTime.getMonth() + 1).padStart(2, '0');
  const day = String(guatemalaTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
