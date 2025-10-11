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

// Obtener notificación específica por ID (para modal de visualización y edición)
export const getNotificacionEspecificaById = async (id) => {
  const res = await apiClient.get(`/api/notificaciones/especifica/${id}`);
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

// ===========================
// 📦 NOTIFICACIONES ESPECÍFICAS
// ===========================

// Obtener notificación específica de expediente
export const getNotificacionExpediente = async (expedienteId) => {
  const res = await apiClient.get(`/api/notificaciones/especifica/expediente/${expedienteId}`);
  return res.data;
};

// Obtener notificación específica de orden
export const getNotificacionOrden = async (ordenId) => {
  const res = await apiClient.get(`/api/notificaciones/especifica/orden/${ordenId}`);
  return res.data;
};

// Crear notificación específica de expediente
export const createNotificacionExpediente = async (expedienteId, data) => {
  const res = await apiClient.post(
    `/api/notificaciones/especifica/expediente/${expedienteId}`,
    data
  );
  return res.data;
};

// Crear notificación específica de orden
export const createNotificacionOrden = async (ordenId, data) => {
  const res = await apiClient.post(`/api/notificaciones/especifica/orden/${ordenId}`, data);
  return res.data;
};

// Actualizar notificación específica
export const updateNotificacionEspecifica = async (id, data) => {
  const res = await apiClient.put(`/api/notificaciones/especifica/${id}`, data);
  return res.data;
};

// Eliminar notificación específica
export const deleteNotificacionEspecifica = async (id) => {
  const res = await apiClient.delete(`/api/notificaciones/especifica/${id}`);
  return res.data;
};

// ✅ Obtener estado optimizado de notificación
export const getEstadoNotificacionExpediente = async (expedienteId) => {
  const res = await apiClient.get(`/api/notificaciones/estado/expediente/${expedienteId}`);
  return res.data;
};

export const getEstadoNotificacionOrden = async (ordenId) => {
  const res = await apiClient.get(`/api/notificaciones/estado/orden/${ordenId}`);
  return res.data;
};
