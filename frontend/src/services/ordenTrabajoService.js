import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/ordenes";

// Obtener todas las órdenes
export const getOrdenes = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Obtener orden por ID
export const getOrdenById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// Crear nueva orden
export const createOrden = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// Actualizar orden
export const updateOrden = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

// Eliminar orden
export const deleteOrden = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

// Obtener último correlativo para sugerencia
export const getLastCorrelativo = async () => {
  const res = await axios.get(`${API_URL}/ultimo-correlativo`);
  return res.data;
};