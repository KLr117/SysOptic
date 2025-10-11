import { apiClient } from './api.js';

// Obtener todos los expedientes
export const getExpedientes = async () => {
  const res = await apiClient.get('/api/expedientes');
  if (res.data.ok && Array.isArray(res.data.expedientes)) {
    return res.data.expedientes;
  } else {
    console.warn('Respuesta del backend no tiene el formato esperado:', res.data);
    return [];
  }
};

// Obtener expediente por ID
export const getExpedienteById = async (id) => {
  const res = await apiClient.get(`/api/expedientes/${id}`);
  if (res.data.ok && res.data.expediente) {
    return res.data.expediente;
  } else {
    console.warn('Respuesta del backend no tiene el formato esperado:', res.data);
    return null;
  }
};

// Crear nuevo expediente
export const createExpediente = async (data) => {
  const res = await apiClient.post('/api/expedientes', data);
  if (res.data.ok && res.data.pk_id_expediente) {
    return { pk_id_expediente: res.data.pk_id_expediente };
  } else {
    console.warn('Respuesta del backend no tiene el formato esperado:', res.data);
    throw new Error('Error al crear expediente');
  }
};

// Actualizar expediente
export const updateExpediente = async (id, data) => {
  const res = await apiClient.put(`/api/expedientes/${id}`, data);
  if (res.data.ok) {
    return res.data;
  } else {
    console.warn('Respuesta del backend no tiene el formato esperado:', res.data);
    throw new Error('Error al actualizar expediente');
  }
};

// Eliminar expediente
export const deleteExpediente = async (id) => {
  const res = await apiClient.delete(`/api/expedientes/${id}`);
  if (res.data.ok) {
    return res.data;
  } else {
    console.warn('Respuesta del backend no tiene el formato esperado:', res.data);
    throw new Error('Error al eliminar expediente');
  }
};

// Obtener último correlativo sugerido
export const getLastCorrelativoExpediente = async () => {
  const res = await apiClient.get('/api/expedientes/ultimo-correlativo');
  if (res.data.ok && res.data.sugerencia !== undefined) {
    return res.data.sugerencia;
  } else {
    console.warn('Respuesta del backend no tiene el formato esperado:', res.data);
    return 1; // Valor por defecto si hay error
  }
};