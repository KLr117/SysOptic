import { apiClient, API_URL } from './api.js';

// Subir imagen para expediente
export const subirImagen = async (expedienteId, imagenFile) => {
  // Crear FormData para enviar archivo multipart
  const formData = new FormData();
  formData.append('imagen', imagenFile); // Archivo de imagen
  formData.append('expediente_id', expedienteId); // ID del expediente

  // Enviar petición POST con FormData
  const res = await apiClient.post('/api/imagenes-expedientes/subir', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Importante: multipart para archivos
    },
  });
  return res.data;
};

// ✅ Obtener imágenes de un expediente específico
export const obtenerImagenesPorExpediente = async (expedienteId) => {
  try {
    const res = await apiClient.get(`/api/imagenes-expedientes/expediente/${expedienteId}`);
    console.log("📸 Imágenes recibidas del backend:", res.data.imagenes);


    if (res.data.success && res.data.imagenes) {
      const BASE_URL = import.meta.env.VITE_ASSET_URL || '';

      res.data.imagenes = res.data.imagenes.map((imagen) => {
        let ruta = imagen.ruta_archivo || '';
        console.log("➡️ Procesando imagen:", imagen.ruta_archivo);

        // ✅ Solo anteponer dominio si NO es una URL completa
        if (!/^https?:\/\//i.test(ruta)) {
          ruta = `${BASE_URL.replace(/\/$/, '')}/${ruta.replace(/^\//, '')}`;
        }

        return {
          ...imagen,
          url: ruta,
        };
      });
    }

    return res.data;
  } catch (error) {
    console.error("❌ Error obteniendo imágenes del expediente:", error);
    return { success: false, imagenes: [] };
  }
};


// Obtener todas las imágenes (para administración)
export const obtenerTodasLasImagenes = async () => {
  const res = await apiClient.get('/api/imagenes-expedientes/todas');

  // Agregar URLs completas para cada imagen
  if (res.data.success && res.data.imagenes) {
    res.data.imagenes = res.data.imagenes.map((imagen) => ({
      ...imagen,
      url: `${API_URL}/api/imagenes-expedientes/servir/${imagen.id}`,
    }));
  }

  return res.data;
};

// Eliminar imagen específica
export const eliminarImagen = async (imagenId) => {
  const res = await apiClient.delete(`/api/imagenes-expedientes/${imagenId}`);
  return res.data;
};

// Contar imágenes por expediente
export const contarImagenesPorExpediente = async (expedienteId) => {
  const res = await apiClient.get(`/api/imagenes-expedientes/contar/${expedienteId}`);
  return res.data;
};

// Función para comprimir imagen antes de subir
export const comprimirImagen = (file, maxWidth = 1080, quality = 0.85) => {
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

      // Configurar canvas con nuevas dimensiones
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada en el canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir canvas a blob con calidad especificada
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob); // Devolver blob comprimido
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        'image/jpeg', // Formato de salida
        quality // Calidad de compresión (0.6 = 60%)
      );
    };

    // Manejar errores de carga de imagen
    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    
    // Cargar imagen desde el archivo
    img.src = URL.createObjectURL(file);
  });
};
