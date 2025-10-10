import { apiClient } from './api.js';

// Obtener todas las notificaciones
export const getNotificaciones = async () => {
  const res = await apiClient.get('/api/notificaciones');
  return res.data;
};

// Crear notificación
export const createNotificacion = async (data) => {
  const res = await apiClient.post('/api/notificaciones', data);
  return res.data;
};

// Obtener notificación por ID
export const getNotificacionById = async (id) => {
  const res = await apiClient.get(`/api/notificaciones/${id}`);
  return res.data;
};

// Actualizar
export const updateNotificacion = async (id, notificacion) => {
  const res = await apiClient.put(`/api/notificaciones/${id}`, notificacion);
  return res.data;
};

// Eliminar
export const deleteNotificacion = async (id) => {
  const res = await apiClient.delete(`/api/notificaciones/${id}`);
  return res.data;
};

// ✅ Actualizar solo el estado de una notificación
export const updateEstadoNotificacion = async (id, nuevoEstado) => {
  const res = await apiClient.put(`/api/notificaciones/estado/${id}`, {
    nuevoEstadoId: nuevoEstado,
  });
  return res.data;
};
