import React from "react";

import { useEffect, useState } from "react";
import { getStats } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Panel de Control</h1>

      {err && <p className="mt-4 text-red-600">Error: {err}</p>}

      {!stats ? (
        <p className="mt-4">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card title="Expedientes" value={stats.expedientes} />
          <Card title="Órdenes" value={stats.ordenes} />
          <Card title="Pend. de entrega" value={stats.pendientesEntrega} />
          <Card title="Notificaciones" value={stats.notificaciones} />
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
