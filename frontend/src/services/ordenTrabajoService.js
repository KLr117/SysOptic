import { API_URL } from "./api.js";

export async function getOrdenes() {
  const res = await fetch(`${API_URL}/api/ordenes`);
  if (!res.ok) throw new Error("Error al obtener órdenes");
  return res.json();
}

export async function getOrdenById(id) {
  const res = await fetch(`${API_URL}/api/ordenes/${id}`);
  if (!res.ok) throw new Error("Error al obtener la orden");
  return res.json();
}

export async function createOrden(data) {
  const res = await fetch(`${API_URL}/api/ordenes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la orden");
  return res.json();
}

export async function updateOrden(id, data) {
  const res = await fetch(`${API_URL}/api/ordenes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar la orden");
  return res.json();
}

export async function deleteOrden(id) {
  const res = await fetch(`${API_URL}/api/ordenes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar la orden");
  return res.json();
}
