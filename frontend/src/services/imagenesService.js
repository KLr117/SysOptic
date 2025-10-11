import { apiClient, API_URL } from './api.js';

// ===== FUNCIONES PARA EXPEDIENTES =====

// Subir imagen de expediente
export const subirImagenExpediente = async (expedienteId, imagenFile) => {
  const formData = new FormData();
  formData.append('imagen', imagenFile);
  formData.append('expediente_id', expedienteId);

  const res = await apiClient.post('/api/imagenes-expedientes/subir', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Obtener imágenes de un expediente específico
export const obtenerImagenesExpediente = async (expedienteId) => {
  const res = await apiClient.get(`/api/imagenes-expedientes/expediente/${expedienteId}`);

  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map((imagen) => ({
      ...imagen,
      url: `${API_URL}/api/imagenes-expedientes/servir/${imagen.pk_id_imagen}`,
      urlPorRuta: `${API_URL}/api/imagenes-expedientes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`,
    }));
  }

  return res.data;
};

// Obtener todas las imágenes de expedientes
export const obtenerTodasLasImagenesExpedientes = async () => {
  const res = await apiClient.get('/api/imagenes-expedientes/todas');

  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map((imagen) => ({
      ...imagen,
      url: `${API_URL}/api/imagenes-expedientes/servir/${imagen.pk_id_imagen}`,
      urlPorRuta: `${API_URL}/api/imagenes-expedientes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`,
    }));
  }

  return res.data;
};

// Eliminar imagen de expediente
export const eliminarImagenExpediente = async (imagenId) => {
  const res = await apiClient.delete(`/api/imagenes-expedientes/${imagenId}`);
  return res.data;
};

// Contar imágenes por expediente
export const contarImagenesExpediente = async (expedienteId) => {
  const res = await apiClient.get(`/api/imagenes-expedientes/contar/${expedienteId}`);
  return res.data;
};

// ===== FUNCIONES PARA ÓRDENES =====

// Subir imagen de orden
export const subirImagenOrden = async (ordenId, imagenFile) => {
  const formData = new FormData();
  formData.append('imagen', imagenFile);
  formData.append('orden_id', ordenId);

  const res = await apiClient.post('/api/imagenes-ordenes/subir', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Obtener imágenes de una orden específica
export const obtenerImagenesOrden = async (ordenId) => {
  const res = await apiClient.get(`/api/imagenes-ordenes/orden/${ordenId}`);

  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map((imagen) => ({
      ...imagen,
      url: `${API_URL}/api/imagenes-ordenes/servir/${imagen.id}`,
      urlPorRuta: `${API_URL}/api/imagenes-ordenes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`,
    }));
  }

  return res.data;
};

// Obtener todas las imágenes de órdenes
export const obtenerTodasLasImagenesOrdenes = async () => {
  const res = await apiClient.get('/api/imagenes-ordenes/todas');

  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map((imagen) => ({
      ...imagen,
      url: `${API_URL}/api/imagenes-ordenes/servir/${imagen.id}`,
      urlPorRuta: `${API_URL}/api/imagenes-ordenes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`,
    }));
  }

  return res.data;
};

// Eliminar imagen de orden
export const eliminarImagenOrden = async (imagenId) => {
  const res = await apiClient.delete(`/api/imagenes-ordenes/${imagenId}`);
  return res.data;
};

// Contar imágenes por orden
export const contarImagenesOrden = async (ordenId) => {
  const res = await apiClient.get(`/api/imagenes-ordenes/contar/${ordenId}`);
  return res.data;
};

// ===== FUNCIONES DE UTILIDAD =====

// Función para comprimir imagen
export const comprimirImagen = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
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

// Validar tipo y tamaño de imagen
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

// Convertir Blob a File
export const blobToFile = (blob, fileName, fileType) => {
  return new File([blob], fileName, { type: fileType });
};

// Previsualizar imagen
export const previsualizarImagen = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Limpiar URL de previsualización
export const limpiarPrevisualizacion = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};