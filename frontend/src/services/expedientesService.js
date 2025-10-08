import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/expedientes";

// Obtener todos los expedientes
export const getExpedientes = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Obtener expediente por ID
export const getExpedienteById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// Crear nuevo expediente
export const createExpediente = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// Actualizar expediente
export const updateExpediente = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

// Eliminar expediente
export const deleteExpediente = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
