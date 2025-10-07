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
      'Authorization': token,
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

// Crear un nuevo usuario
export async function createUser(userData) {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken()
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
}

// Obtener todos los usuarios
export async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        'Authorization': getAuthToken()
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
}

// Actualizar un usuario
export async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken()
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
}

// Eliminar un usuario
export async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthToken()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
}

// Obtener roles disponibles
export async function getRoles() {
  try {
    const response = await fetch(`${API_URL}/api/users/roles`, {
      headers: {
        'Authorization': getAuthToken()
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    throw error;
  }
}

// Asignar permisos a un usuario
export async function assignPermissions(userId, permissions) {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken()
      },
      body: JSON.stringify({ permissions })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error asignando permisos:', error);
    throw error;
  }
}

// Obtener permisos disponibles
export async function getAvailablePermissions() {
  try {
    const response = await fetch(`${API_URL}/api/users/permissions`, {
      headers: {
        'Authorization': getAuthToken()
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    throw error;
  }
}
