import axios from 'axios';
import { API_URL } from './api.js';

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token JWT automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obtener todos los usuarios
export async function getUsers() {
  try {
    const { data } = await api.get('/api/users');
    return data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error.response?.data || { message: 'Error al obtener usuarios' };
  }
}

// Crear un nuevo usuario
export async function createUser(userData) {
  try {
    const { data } = await api.post('/api/users', userData);
    return data;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error.response?.data || { message: 'Error al crear usuario' };
  }
}

// Actualizar un usuario
export async function updateUser(userId, userData) {
  try {
    const { data } = await api.put(`/api/users/${userId}`, userData);
    return data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error.response?.data || { message: 'Error al actualizar usuario' };
  }
}

// Eliminar un usuario
export async function deleteUser(userId) {
  try {
    const { data } = await api.delete(`/api/users/${userId}`);
    return data;
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error.response?.data || { message: 'Error al eliminar usuario' };
  }
}

// Cambiar contraseña de un usuario
export async function changePassword(userId, newPassword) {
  try {
    const { data } = await api.put(`/api/users/${userId}/password`, { newPassword });
    return data;
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    throw error.response?.data || { message: 'Error al cambiar contraseña' };
  }
}

// Obtener roles disponibles
export async function getRoles() {
  try {
    const { data } = await api.get('/api/users/roles');
    return data;
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    throw error.response?.data || { message: 'Error al obtener roles' };
  }
}

// Asignar permisos a un usuario
export async function assignPermissions(userId, permissions) {
  try {
    const { data } = await api.put(`/api/users/${userId}/permissions`, { permissions });
    return data;
  } catch (error) {
    console.error('Error asignando permisos:', error);
    throw error.response?.data || { message: 'Error al asignar permisos' };
  }
}

// Obtener permisos disponibles
export async function getAvailablePermissions() {
  try {
    const { data } = await api.get('/api/users/permissions');
    return data;
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    throw error.response?.data || { message: 'Error al obtener permisos' };
  }
}
