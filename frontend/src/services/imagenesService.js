import { apiClient, API_URL } from './api.js';

// ===== FUNCIONES GENERALES PARA MANEJO DE IMÁGENES =====
/*** Subir imagen genérica
 * @param {FormData} formData - FormData con la imagen y metadatos
 * @param {string} endpoint - Endpoint específico para subir
 * @returns {Promise} Respuesta del servidor
 */
export const subirImagenGenerica = async (formData, endpoint) => {
  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/*** Obtener imágenes por entidad específica
 * @param {string} entityType - Tipo de entidad (ordenes, expedientes, etc.)
 * @param {number} entityId - ID de la entidad
 * @returns {Promise} Lista de imágenes
 */
export const obtenerImagenesPorEntidad = async (entityType, entityId) => {
  try {
    const response = await apiClient.get(`/api/imagenes-${entityType}/entidad/${entityId}`);
    const data = response.data;

    // Agregar URL completa para cada imagen
    if (data.success && data.imagenes) {
      data.imagenes = data.imagenes.map((imagen) => ({
        ...imagen,
        url: `${API_URL}/api/imagenes-${entityType}/servir/${imagen.id}`,
        urlPorRuta: `${API_URL}/api/imagenes-${entityType}/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`,
      }));
    }

    return data;
  } catch (error) {
    console.error(`Error obteniendo imágenes por ${entityType}:`, error);
    throw new Error(`Error al obtener imágenes: ${error.message}`);
  }
};

/** Obtener todas las imágenes de un tipo específico
 * @param {string} entityType - Tipo de entidad
 * @returns {Promise} Lista de todas las imágenes
 */
export const obtenerTodasLasImagenesPorTipo = async (entityType) => {
  try {
    const response = await apiClient.get(`/api/imagenes-${entityType}/todas`);
    const data = response.data;

    // Agregar URL completa para cada imagen
    if (data.success && data.imagenes) {
      data.imagenes = data.imagenes.map((imagen) => ({
        ...imagen,
        url: `${API_URL}/api/imagenes-${entityType}/servir/${imagen.id}`,
        urlPorRuta: `${API_URL}/api/imagenes-${entityType}/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`,
      }));
    }

    return data;
  } catch (error) {
    console.error(`Error obteniendo todas las imágenes de ${entityType}:`, error);
    throw new Error(`Error al obtener imágenes: ${error.message}`);
  }
};

/*** Eliminar imagen genérica
 * @param {string} entityType - Tipo de entidad
 * @param {number} imagenId - ID de la imagen
 * @returns {Promise} Respuesta del servidor
 */
export const eliminarImagenGenerica = async (entityType, imagenId) => {
  try {
    const response = await apiClient.delete(`/api/imagenes-${entityType}/${imagenId}`);
    return response.data;
  } catch (error) {
    console.error(`Error eliminando imagen de ${entityType}:`, error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
};

/** Contar imágenes por entidad
 * @param {string} entityType - Tipo de entidad
 * @param {number} entityId - ID de la entidad
 * @returns {Promise} Número de imágenes
 */
export const contarImagenesPorEntidad = async (entityType, entityId) => {
  try {
    const response = await apiClient.get(`/api/imagenes-${entityType}/contar/${entityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error contando imágenes por ${entityType}:`, error);
    throw new Error(`Error al contar imágenes: ${error.message}`);
  }
};

// ===== FUNCIONES ESPECÍFICAS PARA DIFERENTES ENTIDADES =====
// Para órdenes
export const subirImagenOrden = async (ordenId, imagenFile) => {
  const formData = new FormData();
  formData.append('imagen', imagenFile);
  formData.append('orden_id', ordenId);
  return await subirImagenGenerica(formData, '/api/imagenes-ordenes/subir');
};

export const obtenerImagenesOrden = async (ordenId) => {
  return await obtenerImagenesPorEntidad('ordenes', ordenId);
};

export const eliminarImagenOrden = async (imagenId) => {
  return await eliminarImagenGenerica('ordenes', imagenId);
};

export const contarImagenesOrden = async (ordenId) => {
  return await contarImagenesPorEntidad('ordenes', ordenId);
};

// Para expedientes
export const subirImagenExpediente = async (expedienteId, imagenFile) => {
  const formData = new FormData();
  formData.append('imagen', imagenFile);
  formData.append('expediente_id', expedienteId);
  return await subirImagenGenerica(formData, '/api/imagenes-expedientes/subir');
};

export const obtenerImagenesExpediente = async (expedienteId) => {
  return await obtenerImagenesPorEntidad('expedientes', expedienteId);
};

export const eliminarImagenExpediente = async (imagenId) => {
  return await eliminarImagenGenerica('expedientes', imagenId);
};

export const contarImagenesExpediente = async (expedienteId) => {
  return await contarImagenesPorEntidad('expedientes', expedienteId);
};

// ===== FUNCIONES DE UTILIDAD PARA IMÁGENES =====
/** Función para comprimir imagen
 * @param {File} file - Archivo de imagen a comprimir
 * @param {number} maxWidth - Ancho máximo (default: 800)
 * @param {number} quality - Calidad de compresión (0-1, default: 0.8)
 * @returns {Promise<Blob>} Imagen comprimida como Blob
 */
export const comprimirImagen = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, devolver el archivo original
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob con calidad especificada
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

/** Validar tipo y tamaño de imagen
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 5)
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validarImagen = (file, maxSizeMB = 5) => {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!tiposPermitidos.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Use: ${tiposPermitidos.join(', ')}`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true, error: null };
};

/** Convertir Blob a File
 * @param {Blob} blob - Blob a convertir
 * @param {string} fileName - Nombre del archivo
 * @param {string} fileType - Tipo MIME del archivo
 * @returns {File} Objeto File
 */
export const blobToFile = (blob, fileName, fileType) => {
  return new File([blob], fileName, { type: fileType });
};

/** * Previsualizar imagen
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL de previsualización
 */
export const previsualizarImagen = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/** Limpiar URL de previsualización
 * @param {string} url - URL a limpiar
 */
export const limpiarPrevisualizacion = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export default {
  // Funciones generales
  subirImagenGenerica,
  obtenerImagenesPorEntidad,
  obtenerTodasLasImagenesPorTipo,
  eliminarImagenGenerica,
  contarImagenesPorEntidad,

  // Funciones específicas para órdenes
  subirImagenOrden,
  obtenerImagenesOrden,
  eliminarImagenOrden,
  contarImagenesOrden,

  // Funciones específicas para expedientes
  subirImagenExpediente,
  obtenerImagenesExpediente,
  eliminarImagenExpediente,
  contarImagenesExpediente,

  // Funciones de utilidad
  comprimirImagen,
  validarImagen,
  blobToFile,
  previsualizarImagen,
  limpiarPrevisualizacion,
};
