const API_BASE_URL = 'http://localhost:4000/api';

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Función para hacer peticiones autenticadas
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`, // Temporalmente deshabilitado
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Subir imagen
export const subirImagen = async (ordenId, imagenFile) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('imagen', imagenFile);
    formData.append('orden_id', ordenId);

    const response = await fetch(`${API_BASE_URL}/imagenes-ordenes/subir`, {
      method: 'POST',
      // headers: {
      //   'Authorization': `Bearer ${token}` // Temporalmente deshabilitado
      // },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

// Obtener imágenes de una orden específica
export const obtenerImagenesPorOrden = async (ordenId) => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/imagenes-ordenes/orden/${ordenId}`);
    
    // Agregar URL completa para cada imagen
    if (response.success && response.imagenes) {
      response.imagenes = response.imagenes.map(imagen => ({
        ...imagen,
        url: `${API_BASE_URL}/imagenes-ordenes/servir/${imagen.id}`,
        urlPorRuta: `${API_BASE_URL}/imagenes-ordenes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error obteniendo imágenes por orden:', error);
    throw error;
  }
};

// Obtener todas las imágenes
export const obtenerTodasLasImagenes = async () => {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/imagenes-ordenes/todas`);
    
    // Agregar URL completa para cada imagen
    if (response.success && response.imagenes) {
      response.imagenes = response.imagenes.map(imagen => ({
        ...imagen,
        url: `${API_BASE_URL}/imagenes-ordenes/servir/${imagen.id}`,
        urlPorRuta: `${API_BASE_URL}/imagenes-ordenes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error obteniendo todas las imágenes:', error);
    throw error;
  }
};

// Eliminar imagen
export const eliminarImagen = async (imagenId) => {
  try {
    return await makeAuthenticatedRequest(`${API_BASE_URL}/imagenes-ordenes/${imagenId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
};

// Contar imágenes por orden
export const contarImagenesPorOrden = async (ordenId) => {
  try {
    return await makeAuthenticatedRequest(`${API_BASE_URL}/imagenes-ordenes/contar/${ordenId}`);
  } catch (error) {
    console.error('Error contando imágenes por orden:', error);
    throw error;
  }
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
