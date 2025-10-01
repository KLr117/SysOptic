import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/notificaciones";

// Obtener todas las notificaciones
export const getNotificaciones = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Crear notificación
export const createNotificacion = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// Obtener notificación por ID
export const getNotificacionById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// Actualizar
export const updateNotificacion = async (id, notificacion) => {
  const res = await axios.put(`${API_URL}/${id}`, notificacion);
  return res.data;
};

// Eliminar
export const deleteNotificacion = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
