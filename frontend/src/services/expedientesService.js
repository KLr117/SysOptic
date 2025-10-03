import { API_URL } from "./api.js";
//  Función para manejar respuestas de la API
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error en la API: ${res.status} - ${text}`);
  }
  try {
    return await res.json();
  } catch {
    return null; // en caso de que no haya JSON válido
  }
}

//  Obtener todos los expedientes
export async function getExpedientes() {
  const res = await fetch(`${API_URL}/api/expedientes`);
  const data = await res.json();
  return data.expedientes || [];
}

// 🔹 Obtener expediente por ID
export async function getExpedienteById(id) {
  const res = await fetch(`${API_URL}/api/expedientes/${id}`);
  return handleResponse(res, "Error al obtener el expediente");
}

// 🔹 Crear nuevo expediente
export async function createExpediente(data) {
  const res = await fetch(`${API_URL}/api/expedientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Error al crear el expediente");
}

// 🔹 Actualizar expediente
export async function updateExpediente(id, data) {
  const res = await fetch(`${API_URL}/api/expedientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Error al actualizar el expediente");
}

// 🔹 Eliminar expediente
export async function deleteExpediente(id) {
  const res = await fetch(`${API_URL}/api/expedientes/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res, "Error al eliminar el expediente");
}