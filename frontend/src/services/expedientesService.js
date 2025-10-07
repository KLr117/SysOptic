import { API_URL } from "./api.js";
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

// Función para manejar respuestas de la API
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error en la API: ${res.status} - ${text}`);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Obtener todos los expedientes
export async function getExpedientes() {
  const res = await fetch(`${API_URL}/api/expedientes`);
  const data = await res.json();
  return data.expedientes || [];
}

// Obtener expediente por ID
export async function getExpedienteById(id) {
  const res = await fetch(`${API_URL}/api/expedientes/${id}`);
  return handleResponse(res);
}

// Crear nuevo expediente (SIN FOTOS por ahora)
export async function createExpediente(expedienteData) {
  try {
    const response = await fetch(`${API_URL}/api/expedientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correlativo: expedienteData.correlativo || '',
        nombre: expedienteData.nombre || '',
        telefono: expedienteData.telefono || '',
        direccion: expedienteData.direccion || '',
        email: expedienteData.email || '',
        fecha_registro: expedienteData.fecha_registro || ''
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creando expediente:', error);
    throw error;
  }
}

// Actualizar expediente (SIN FOTOS por ahora)
export async function updateExpediente(id, expedienteData) {
  try {
    const response = await fetch(`${API_URL}/api/expedientes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correlativo: expedienteData.correlativo || '',
        nombre: expedienteData.nombre || '',
        telefono: expedienteData.telefono || '',
        direccion: expedienteData.direccion || '',
        email: expedienteData.email || '',
        fecha_registro: expedienteData.fecha_registro || ''
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error actualizando expediente:', error);
    throw error;
  }
}

// Eliminar expediente
export async function deleteExpediente(id) {
  const res = await fetch(`${API_URL}/api/expedientes/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ===== SERVICIOS PARA MANEJO ESPECÍFICO DE FOTOS =====

// Subir foto a expediente existente
export const subirFotoExpediente = async (expedienteId, imagenFile) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('imagen', imagenFile);
    formData.append('expediente_id', expedienteId);

    const response = await fetch(`${API_URL}/api/imagenes-expedientes/subir`, {
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
    console.error('Error subiendo imagen de expediente:', error);
    throw error;
  }
};

// Obtener fotos de un expediente específico
export const obtenerFotosPorExpediente = async (expedienteId) => {
  try {
    const response = await makeAuthenticatedRequest(`${API_URL}/api/imagenes-expedientes/expediente/${expedienteId}`);
    
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
    throw error;
  }
};

// Eliminar foto de expediente
export const eliminarFotoExpediente = async (imagenId) => {
  try {
    return await makeAuthenticatedRequest(`${API_URL}/api/imagenes-expedientes/${imagenId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error eliminando imagen de expediente:', error);
    throw error;
  }
};

// Contar fotos por expediente
export const contarFotosPorExpediente = async (expedienteId) => {
  try {
    return await makeAuthenticatedRequest(`${API_URL}/api/imagenes-expedientes/contar/${expedienteId}`);
  } catch (error) {
    console.error('Error contando imágenes por expediente:', error);
    throw error;
  }
};

// ===== FUNCIONES AUXILIARES =====

// Función para convertir Base64 a Blob
function base64ToBlob(base64) {
  if (!base64 || typeof base64 !== 'string') {
    throw new Error('Base64 no válido');
  }
  
  const parts = base64.split(';base64,');
  if (parts.length !== 2) {
    throw new Error('Formato Base64 incorrecto');
  }
  
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  
  for (let i = 0; i < raw.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

// Función para comprimir imagen (igual que en órdenes)
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