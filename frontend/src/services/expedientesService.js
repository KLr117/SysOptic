import { API_URL } from "./api.js";
import axios from 'axios';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token si está disponible
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // config.headers.Authorization = `Bearer ${token}`; // Temporalmente deshabilitado
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Error en la petición:', error);
    throw error;
  }
);

// Obtener todos los expedientes
export async function getExpedientes() {
  try {
    const response = await apiClient.get('/api/expedientes');
    return response.expedientes || [];
  } catch (error) {
    console.error('Error obteniendo expedientes:', error);
    throw new Error(`Error al obtener expedientes: ${error.message}`);
  }
}

// Obtener expediente por ID
export async function getExpedienteById(id) {
  try {
    const response = await apiClient.get(`/api/expedientes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error obteniendo expediente ${id}:`, error);
    throw new Error(`Error al obtener el expediente: ${error.message}`);
  }
}

// Crear nuevo expediente
export async function createExpediente(expedienteData) {
  try {
    const response = await apiClient.post('/api/expedientes', {
      correlativo: expedienteData.correlativo || '',
      nombre: expedienteData.nombre || '',
      telefono: expedienteData.telefono || '',
      direccion: expedienteData.direccion || '',
      email: expedienteData.email || '',
      fecha_registro: expedienteData.fecha_registro || ''
    });
    return response;
  } catch (error) {
    console.error('Error creando expediente:', error);
    throw new Error(`Error al crear expediente: ${error.message}`);
  }
}

// Actualizar expediente
export async function updateExpediente(id, expedienteData) {
  try {
    const response = await apiClient.put(`/api/expedientes/${id}`, {
      correlativo: expedienteData.correlativo || '',
      nombre: expedienteData.nombre || '',
      telefono: expedienteData.telefono || '',
      direccion: expedienteData.direccion || '',
      email: expedienteData.email || '',
      fecha_registro: expedienteData.fecha_registro || ''
    });
    return response;
  } catch (error) {
    console.error(`Error actualizando expediente ${id}:`, error);
    throw new Error(`Error al actualizar expediente: ${error.message}`);
  }
}

// Eliminar expediente
export async function deleteExpediente(id) {
  try {
    const response = await apiClient.delete(`/api/expedientes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error eliminando expediente ${id}:`, error);
    throw new Error(`Error al eliminar expediente: ${error.message}`);
  }
}

// ===== SERVICIOS PARA MANEJO ESPECÍFICO DE FOTOS =====

// Subir foto a expediente existente
export const subirFotoExpediente = async (expedienteId, imagenFile) => {
  try {
    const formData = new FormData();
    formData.append('imagen', imagenFile);
    formData.append('expediente_id', expedienteId);

    const response = await apiClient.post('/api/imagenes-expedientes/subir', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error subiendo imagen de expediente:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

// Obtener fotos de un expediente específico
export const obtenerFotosPorExpediente = async (expedienteId) => {
  try {
    const response = await apiClient.get(`/api/imagenes-expedientes/expediente/${expedienteId}`);
    
    // Agregar URL completa para cada imagen
    if (response.success && response.imagenes) {
      response.imagenes = response.imagenes.map(imagen => ({
        ...imagen,
        url: `${API_URL}/api/imagenes-expedientes/servir/${imagen.id}`,
        urlPorRuta: `${API_URL}/api/imagenes-expedientes/servir-ruta/${encodeURIComponent(imagen.ruta_archivo)}`
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error obteniendo imágenes por expediente:', error);
    throw new Error(`Error al obtener imágenes: ${error.message}`);
  }
};

// Eliminar foto de expediente
export const eliminarFotoExpediente = async (imagenId) => {
  try {
    const response = await apiClient.delete(`/api/imagenes-expedientes/${imagenId}`);
    return response;
  } catch (error) {
    console.error('Error eliminando imagen de expediente:', error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
};

// Contar fotos por expediente
export const contarFotosPorExpediente = async (expedienteId) => {
  try {
    const response = await apiClient.get(`/api/imagenes-expedientes/contar/${expedienteId}`);
    return response;
  } catch (error) {
    console.error('Error contando imágenes por expediente:', error);
    throw new Error(`Error al contar imágenes: ${error.message}`);
  }
};

// ===== FUNCIONES AUXILIARES =====

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

// Función para validar imagen
export const validarImagenExpediente = (file, maxSizeMB = 5) => {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!tiposPermitidos.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Use: ${tiposPermitidos.join(', ')}`
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`
    };
  }

  return { isValid: true, error: null };
};

export default {
  getExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  subirFotoExpediente,
  obtenerFotosPorExpediente,
  eliminarFotoExpediente,
  contarFotosPorExpediente,
  comprimirImagen,
  validarImagenExpediente
};