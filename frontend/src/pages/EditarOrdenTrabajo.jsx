import React from "react";
import { useNavigate } from "react-router-dom"; //  Importar useNavigate

import "../styles/vista-orden-trabajo.css";
import logo from "../public/logo.jpg"; //  Importamos el logo desde src
import Button from "../components/Button";
import Titulo from "../components/Titulo"; //  Importamos el nuevo componente Titulo

const EditarOrdenTrabajo = () => {
  const navigate = useNavigate(); // Hook para navegación
 // Función para cerrar el formulario
  const cerrarFormulario = () => {
    navigate("/ordenes"); // Redirige a la lista de órdenes
  };

  return (
    <div className="orden-container">
       {/* Header con logo y número de orden */}
      <div className="orden-header">

        <div className="orden-logo">
          <img src={logo} alt="Logo Empresa" /> {/* Usamos la variable importada */}

        </div>
        <div className="orden-no">
          <label>No Orden</label>
          <input type="text" placeholder="Ej: 003" />
        </div>
      </div>


  {/* 🔹 Aquí colocamos el título centrado */}
      <Titulo text="Editar Orden de Trabajo" size={32} className="titulo" />


      {/* Información del paciente */}
      <div className="orden-info">
        <div className="orden-row">
          <div className="orden-field">
            <label>Paciente</label>
            <input type="text" placeholder="Nombre del paciente" />
          </div>
        </div>

        <div className="orden-row">
          <div className="orden-field">
            <label>Dirección de domicilio</label>
            <input type="text" placeholder="Dirección del paciente" />
          </div>
          <div className="orden-field">
            <label>Correo</label>
            <input type="email" placeholder="ejemplo@correo.com" />
          </div>
        </div>

        <div className="orden-row">
          <div className="orden-field">
            <label>Fecha Recepción</label>
            <input type="date" />
          </div>
          <div className="orden-field">
            <label>Fecha Entrega</label>
            <input type="date" />
          </div>
        </div>
      </div>

      {/* Totales */}
      <div className="orden-totales">
        <div className="orden-total">
          <label>Total: Q</label>
          <input type="number" placeholder="0.00" />
        </div>
        <div className="orden-adelanto">
          <label>Adelanto: Q</label>
          <input type="number" placeholder="0.00" />
        </div>
        <div className="orden-saldo">
          <label>Saldo: Q</label>
          <input type="number" placeholder="0.00" />
        </div>
      </div>

      {/* Botones */}
      <div className="agregarorden-actions">

        <button className="btn-save">Guardar</button>
       <button className="btn-close" onClick={cerrarFormulario}>Cerrar</button>
      </div>
    </div>
  );
};

export default EditarOrdenTrabajo;
