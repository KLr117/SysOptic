import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/vista-orden-trabajo.css";
import logo from "../assets/logo.jpg";
import { getOrdenById } from "../services/ordenTrabajoService";



const VerOrdenTrabajo = () => {
  const { id } = useParams(); // 🔹 Capturamos el ID de la orden
  const navigate = useNavigate();

  // Estados para manejar la orden
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de la orden desde el backend
  useEffect(() => {
    const cargarOrden = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrdenById(id);
        
        if (response.ok) {
          setOrden(response.order);
        } else {
          setError("Error al cargar la orden");
        }
      } catch (err) {
        console.error("Error cargando orden:", err);
        setError("Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarOrden();
    }
  }, [id]);

  // Mostrar loading
  if (loading) {
    return (
      <div className="orden-container verorden-container">
        <div className="text-center py-8">
          <p>Cargando orden...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="orden-container verorden-container">
        <div className="text-center py-8 text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={() => navigate("/ordenes")} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver a Órdenes
          </button>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no se encuentra la orden
  if (!orden) {
    return (
      <div className="orden-container verorden-container">
        <div className="text-center py-8">
          <p>Orden no encontrada</p>
          <button 
            onClick={() => navigate("/ordenes")} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver a Órdenes
          </button>
        </div>
      </div>
    );
  }

  const cerrarVista = () => {
    navigate("/ordenes");
  };

  return (
   <div className="orden-container verorden-container">
  {/* Header con logo y número de orden */}
  <div className="orden-header">
    <div className="orden-logo">
      <img src={logo} alt="Logo Empresa" />
    </div>
    <div className="orden-no">
      <label>No Orden</label>
      <p>{orden.correlativo || orden.pk_id_orden}</p>
    </div>
  </div>

  {/* Información del paciente */}
  <div className="orden-info">
    <div className="orden-row">
      <div className="orden-field">
        <label>Paciente</label>
        <p>{orden.paciente}</p>
      </div>
    </div>

    <div className="orden-row">
      <div className="orden-field">
        <label>Dirección de domicilio</label>
        <p>{orden.direccion}</p>
      </div>
      <div className="orden-field">
        <label>Correo</label>
        <p>{orden.correo}</p>
      </div>
    </div>

    <div className="orden-row">
      <div className="orden-field">
        <label>Teléfono</label>
        <p>{orden.telefono}</p>
      </div>
    </div>

    <div className="orden-row">
      <div className="orden-field">
        <label>Fecha Recepción</label>
        <p>{orden.fecha_recepcion ? new Date(orden.fecha_recepcion).toLocaleDateString('es-ES') : 'No especificada'}</p>
      </div>
      <div className="orden-field">
        <label>Fecha Entrega</label>
        <p>{orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString('es-ES') : 'No especificada'}</p>
      </div>
    </div>
  </div>

  {/* Totales */}
  <div className="orden-totales">
    <div className="orden-total">
      <label>Total: Q</label>
      <p>{parseFloat(orden.total || 0).toFixed(2)}</p>
    </div>
    <div className="orden-adelanto">
      <label>Adelanto: Q</label>
      <p>{parseFloat(orden.adelanto || 0).toFixed(2)}</p>
    </div>
    <div className="orden-saldo">
      <label>Saldo: Q</label>
      <p>{parseFloat(orden.saldo || 0).toFixed(2)}</p>
    </div>
  </div>

  {/* Botón cerrar */}
  <div className="agregarorden-actions">
    <button className="btn-close" onClick={cerrarVista}>
      Cerrar
    </button>
  </div>
</div>
  );
};

export default VerOrdenTrabajo;