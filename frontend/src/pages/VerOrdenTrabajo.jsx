import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../styles/vista-orden-trabajo.css"; // este será el general de estilos
import logo from "../assets/logo.jpg";



const VerOrdenTrabajo = () => {
  const { id } = useParams(); // 🔹 Capturamos el ID de la orden
  const navigate = useNavigate();

  // 🔹 Datos dummy (luego puedes reemplazar por fetch a backend)
  const ordenesData = [
    {
      id: 1,
      noOrden: "001",
      paciente: "Juan Pérez",
      direccion: "Calle 123",
      correo: "juan@example.com",
      domiciliar: "Sí",
      telefono: "555-1234",
      fechaRecepcion: "04/09/2025",
      fechaEntrega: "10/09/2025",
      total: 150,
      adelanto: 50,
      saldo: 100,
    },
    {
      id: 2,
      noOrden: "002",
      paciente: "María López",
      direccion: "Av. Central 456",
      correo: "maria@example.com",
      domiciliar: "No",
      telefono: "555-5678",
      fechaRecepcion: "03/09/2025",
      fechaEntrega: "09/09/2025",
      total: 200,
      adelanto: 100,
      saldo: 100,
    },
  ];

  // Buscar la orden por ID
  const orden = ordenesData.find((o) => o.id === Number(id));

  if (!orden) {
    return <p>Orden no encontrada</p>;
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
      <p>{orden.noOrden}</p>
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
        <label>Domiciliar</label>
        <p>{orden.domiciliar}</p>
      </div>
      <div className="orden-field">
        <label>Teléfono</label>
        <p>{orden.telefono}</p>
      </div>
    </div>

    <div className="orden-row">
      <div className="orden-field">
        <label>Fecha Recepción</label>
        <p>{orden.fechaRecepcion}</p>
      </div>
      <div className="orden-field">
        <label>Fecha Entrega</label>
        <p>{orden.fechaEntrega}</p>
      </div>
    </div>
  </div>

  {/* Totales */}
  <div className="orden-totales">
    <div className="orden-total">
      <label>Total: Q</label>
      <p>{orden.total}</p>
    </div>
    <div className="orden-adelanto">
      <label>Adelanto: Q</label>
      <p>{orden.adelanto}</p>
    </div>
    <div className="orden-saldo">
      <label>Saldo: Q</label>
      <p>{orden.saldo}</p>
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