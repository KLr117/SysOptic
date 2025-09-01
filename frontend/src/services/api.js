export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function getStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error("Error al obtener estadísticas");
  return res.json();
}
