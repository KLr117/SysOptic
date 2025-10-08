import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api/expedientes";

// Obtener todos los expedientes
export const getExpedientes = async () => {
  const res = await axios.get(API_URL);
  // El backend retorna { ok: true, expedientes: [...] }
  // Necesitamos extraer el array de expedientes
  if (res.data.ok && Array.isArray(res.data.expedientes)) {
    return res.data.expedientes;
  } else {
    console.warn("Respuesta del backend no tiene el formato esperado:", res.data);
    return [];
  }
};

// Obtener expediente por ID
export const getExpedienteById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  if (res.data.ok && res.data.expediente) {
    return res.data.expediente;
  } else {
    console.warn("Respuesta del backend no tiene el formato esperado:", res.data);
    return null;
  }
};

// Crear nuevo expediente
export const createExpediente = async (data) => {
  const res = await axios.post(API_URL, data);
  if (res.data.ok && res.data.pk_id_expediente) {
    return { pk_id_expediente: res.data.pk_id_expediente };
  } else {
    console.warn("Respuesta del backend no tiene el formato esperado:", res.data);
    throw new Error("Error al crear expediente");
  }
};

// Actualizar expediente
export const updateExpediente = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  if (res.data.ok) {
    return res.data;
  } else {
    console.warn("Respuesta del backend no tiene el formato esperado:", res.data);
    throw new Error("Error al actualizar expediente");
  }
};

// Eliminar expediente
export const deleteExpediente = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  if (res.data.ok) {
    return res.data;
  } else {
    console.warn("Respuesta del backend no tiene el formato esperado:", res.data);
    throw new Error("Error al eliminar expediente");
  }
};
