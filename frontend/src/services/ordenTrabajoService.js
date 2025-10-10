import { apiClient } from './api.js';

// Obtener todas las órdenes
export const getOrdenes = async () => {
  const res = await apiClient.get('/api/ordenes');
  return res.data;
};

// Obtener orden por ID
export const getOrdenById = async (id) => {
  const res = await apiClient.get(`/api/ordenes/${id}`);
  return res.data;
};

// Crear nueva orden
export const createOrden = async (data) => {
  const res = await apiClient.post('/api/ordenes', data);
  return res.data;
};

// Actualizar orden
export const updateOrden = async (id, data) => {
  const res = await apiClient.put(`/api/ordenes/${id}`, data);
  return res.data;
};

// Eliminar orden
export const deleteOrden = async (id) => {
  const res = await apiClient.delete(`/api/ordenes/${id}`);
  return res.data;
};

// Obtener último correlativo para sugerencia
export const getLastCorrelativo = async () => {
  const res = await apiClient.get('/api/ordenes/ultimo-correlativo');
  return res.data;
};
