// src/pages/Bitacora.jsx
import React, { useEffect, useState } from 'react';
import '../styles/bitacora.css';
import Titulo from '../components/Titulo';
import { apiClient } from '../services/api';

// Función para formatear fecha y hora en zona horaria de Guatemala
const formatearFechaHoraGuatemala = (fechaISO) => {
  if (!fechaISO) return { fecha: '—', hora: '—' };

  const fecha = new Date(fechaISO);

  // Formatear fecha y hora en zona horaria de Guatemala (America/Guatemala)
  const opcionesFecha = {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const opcionesHora = {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Formato 24 horas
  };

  const fechaFormateada = fecha.toLocaleDateString('es-GT', opcionesFecha);
  const horaFormateada = fecha.toLocaleTimeString('es-GT', opcionesHora);

  return { fecha: fechaFormateada, hora: horaFormateada };
};

export default function Bitacora() {
  const [bitacora, setBitacora] = useState([]);

  useEffect(() => {
    fetchBitacora();
  }, []);

  const fetchBitacora = async () => {
    try {
      const { data } = await apiClient.get('/api/bitacora');
      if (data.ok && Array.isArray(data.bitacora)) {
        setBitacora(data.bitacora);
      } else {
        alert('Error al obtener la bitácora');
      }
    } catch (error) {
      console.error('Error al obtener bitácora:', error);
      alert('Error de conexión o permisos insuficientes');
    }
  };

  const closeBitacora = () => {
    window.history.back(); // vuelve a la página anterior (AdminPanel)
  };

  return (
    <div className="bitacora-page">
      {/* 🔹 Título centrado */}
      <div className="bitacora-header">
        <Titulo text="Bitácora de Acciones" size={32} className="titulo" />
        <button className="btn-close" onClick={closeBitacora}>
          Cerrar
        </button>
      </div>

      <div className="bitacora-table-wrapper">
        <table className="bitacora-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Usuario Objetivo</th>
              <th>Fecha</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {bitacora.map((b) => {
              const { fecha, hora } = formatearFechaHoraGuatemala(b.fecha_accion);
              return (
                <tr key={b.pk_id_bitacora}>
                  <td>{b.pk_id_bitacora}</td>
                  <td>{b.usuario_accion || '—'}</td>
                  <td>{b.accion}</td>
                  <td>{b.usuario_objetivo || '—'}</td>
                  <td>{fecha}</td>
                  <td>{hora}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
