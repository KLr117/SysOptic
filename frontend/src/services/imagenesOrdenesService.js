import { apiClient, API_URL } from './api.js';

// Subir imagen
export const subirImagen = async (ordenId, imagenFile) => {
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
export const obtenerImagenesPorOrden = async (ordenId) => {
  const res = await apiClient.get(`/api/imagenes-ordenes/orden/${ordenId}`);

  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map((imagen) => ({
      ...imagen,
      url: imagen.ruta_archivo?.startsWith('http')
  ? imagen.ruta_archivo
  : `${import.meta.env.VITE_ASSET_URL}${imagen.ruta_archivo}`,
    }));
  }

  return res.data;
};

// Obtener todas las imágenes
export const obtenerTodasLasImagenes = async () => {
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

// Eliminar imagen
export const eliminarImagen = async (imagenId) => {
  const res = await apiClient.delete(`/api/imagenes-ordenes/${imagenId}`);
  return res.data;
};

// Contar imágenes por orden
export const contarImagenesPorOrden = async (ordenId) => {
  const res = await apiClient.get(`/api/imagenes-ordenes/contar/${ordenId}`);
  return res.data;
};

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
