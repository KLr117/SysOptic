import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import "../styles/orden-trabajo.css";
import "../styles/vista-orden-trabajo.css";
import "../styles/popup.css";
import logo from "../assets/logo.jpg"; // Importamos el logo desde src
import Titulo from "../components/Titulo"; // Importamos el nuevo componente Titulo
import PopUp from "../components/PopUp";
import { createOrden } from "../services/ordenTrabajoService";


const AgregarOrdenTrabajo = () => {
  const navigate = useNavigate(); // Hook para navegación
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    paciente: '',
    direccion: '',
    correo: '',
    telefono: '',
    fecha_recepcion: '',
    fecha_entrega: '',
    total: '',
    adelanto: '',
    saldo: ''
  });

  // Estados para PopUp
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Función para cerrar el formulario
  const cerrarFormulario = () => {
    navigate("/ordenes"); // Redirige a la lista de órdenes
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular saldo automáticamente cuando cambian total o adelanto
    if (name === 'total' || name === 'adelanto') {
      const total = name === 'total' ? parseFloat(value) || 0 : parseFloat(formData.total) || 0;
      const adelanto = name === 'adelanto' ? parseFloat(value) || 0 : parseFloat(formData.adelanto) || 0;
      const saldo = total - adelanto;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        saldo: saldo.toString()
      }));
    }
  };

  // Función para guardar la orden
  const handleGuardar = async () => {
    try {
      // Validaciones básicas
      if (!formData.paciente || !formData.telefono) {
        setPopup({
          isOpen: true,
          title: 'Campos Requeridos',
          message: 'Paciente y teléfono son campos obligatorios.',
          type: 'warning'
        });
        return;
      }

      // Preparar datos para enviar
      const orderData = {
        paciente: formData.paciente,
        direccion: formData.direccion,
        correo: formData.correo,
        telefono: formData.telefono,
        fecha_recepcion: formData.fecha_recepcion,
        fecha_entrega: formData.fecha_entrega,
        total: parseFloat(formData.total) || 0,
        adelanto: parseFloat(formData.adelanto) || 0,
        saldo: parseFloat(formData.saldo) || 0
      };

      const response = await createOrden(orderData);
      
      if (response.ok) {
        setPopup({
          isOpen: true,
          title: 'Registro Ingresado',
          message: 'La orden de trabajo ha sido creada exitosamente.',
          type: 'success'
        });
        // Navegar después de mostrar el mensaje
        setTimeout(() => {
          navigate("/ordenes");
        }, 2000);
      } else {
        setPopup({
          isOpen: true,
          title: 'Error',
          message: 'Error al crear la orden. Intente nuevamente.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error al crear orden:', error);
      setPopup({
        isOpen: true,
        title: 'Error',
        message: 'Error al crear la orden. Intente nuevamente.',
        type: 'error'
      });
    }
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
     <Titulo text="Agregar Orden de Trabajo" size={32} className="titulo" />


      {/* Información del paciente */}
      <div className="orden-info">
        <div className="orden-row">
          <div className="orden-field">
            <label>Paciente</label>
            <input 
              type="text" 
              name="paciente"
              value={formData.paciente}
              onChange={handleInputChange}
              placeholder="Nombre del paciente" 
            />
          </div>
        </div>

        <div className="orden-row">
          <div className="orden-field">
            <label>Dirección de domicilio</label>
            <input 
              type="text" 
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Dirección del paciente" 
            />
          </div>
          <div className="orden-field">
            <label>Correo</label>
            <input 
              type="email" 
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              placeholder="ejemplo@correo.com" 
            />
          </div>
        </div>

        <div className="orden-row">
          <div className="orden-field">
            <label>Teléfono</label>
            <input 
              type="tel" 
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="Número de teléfono" 
            />
          </div>
        </div>

        <div className="orden-row">
          <div className="orden-field">
            <label>Fecha Recepción</label>
            <input 
              type="date" 
              name="fecha_recepcion"
              value={formData.fecha_recepcion}
              onChange={handleInputChange}
            />
          </div>
          <div className="orden-field">
            <label>Fecha Entrega</label>
            <input 
              type="date" 
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Totales */}
      <div className="orden-totales">
        <div className="orden-total">
          <label>Total: Q</label>
          <input 
            type="number" 
            name="total"
            value={formData.total}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="0.00" 
          />
        </div>
        <div className="orden-adelanto">
          <label>Adelanto: Q</label>
          <input 
            type="number" 
            name="adelanto"
            value={formData.adelanto}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="0.00" 
          />
        </div>
        <div className="orden-saldo">
          <label>Saldo: Q <span className="text-xs text-gray-500">(calculado automáticamente)</span></label>
          <input 
            type="number" 
            name="saldo"
            value={formData.saldo}
            readOnly
            className="bg-gray-300 text-gray-600 cursor-not-allowed"
            style={{ backgroundColor: '#d1d5db', color: '#4b5563' }}
            placeholder="0.00" 
          />
        </div>
      </div>

      {/* Botones */}
      <div className="agregarorden-actions">
        <button className="btn-save" onClick={handleGuardar}>Guardar</button>
        <button className="btn-close" onClick={cerrarFormulario}>Cerrar</button>
      </div>

      {/* PopUp para mensajes */}
      <PopUp
        isOpen={popup.isOpen}
        onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        autoClose={popup.type === 'success'}
        autoCloseDelay={2000}
      />
    </div>
  );
};

export default AgregarOrdenTrabajo;
