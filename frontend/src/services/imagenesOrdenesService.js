import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/imagenes-ordenes";

// Subir imagen
export const subirImagen = async (ordenId, imagenFile) => {
  const formData = new FormData();
  formData.append('imagen', imagenFile);
  formData.append('orden_id', ordenId);
  
  const res = await axios.post(`${API_URL}/subir`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return res.data;
};

// Obtener imágenes de una orden específica
export const obtenerImagenesPorOrden = async (ordenId) => {
  const res = await axios.get(`${API_URL}/orden/${ordenId}`);
  
  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map(imagen => ({
      ...imagen,
      url: `${import.meta.env.VITE_API_URL}/api/imagenes-ordenes/servir/${imagen.id}`,
      urlPorRuta: `${import.meta.env.VITE_API_URL}/api/imagenes-ordenes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`
    }));
  }
  
  return res.data;
};

// Obtener todas las imágenes
export const obtenerTodasLasImagenes = async () => {
  const res = await axios.get(`${API_URL}/todas`);
  
  // Agregar URL completa para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map(imagen => ({
      ...imagen,
      url: `${import.meta.env.VITE_API_URL}/api/imagenes-ordenes/servir/${imagen.id}`,
      urlPorRuta: `${import.meta.env.VITE_API_URL}/api/imagenes-ordenes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`
    }));
  }
  
  return res.data;
};

// Eliminar imagen
export const eliminarImagen = async (imagenId) => {
  const res = await axios.delete(`${API_URL}/${imagenId}`);
  return res.data;
};

// Contar imágenes por orden
export const contarImagenesPorOrden = async (ordenId) => {
  const res = await axios.get(`${API_URL}/contar/${ordenId}`);
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
