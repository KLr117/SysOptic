import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import "../styles/orden-trabajo.css";
import "../styles/vista-orden-trabajo.css";
import "../styles/popup.css";
import logo from "../assets/logo.jpg"; // Importamos el logo desde src
import Titulo from "../components/Titulo"; // Importamos el nuevo componente Titulo
import PopUp from "../components/PopUp";
import { createOrden, getOrdenes, getLastCorrelativo } from "../services/ordenTrabajoService";
import { subirImagen } from "../services/imagenesOrdenesService";


const AgregarOrdenTrabajo = () => {
  const navigate = useNavigate(); // Hook para navegación
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    numero_orden: '',
    paciente: '',
    direccion: '',
    correo: '',
    telefono: '',
    fecha_recepcion: '',
    fecha_entrega: '',
    total: '',
    adelanto: '',
    saldo: '',
    observaciones: ''
  });

  // Estados para PopUp
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Estados para imágenes
  const [imagenes, setImagenes] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Estado para sugerencia de correlativo
  const [sugerenciaCorrelativo, setSugerenciaCorrelativo] = useState('');

  // Función para obtener la sugerencia de correlativo
  const obtenerSugerenciaCorrelativo = async () => {
    try {
      const response = await getLastCorrelativo();
      if (response.ok) {
        setSugerenciaCorrelativo(response.sugerencia);
      }
    } catch (error) {
      console.error('Error al obtener sugerencia de correlativo:', error);
    }
  };

  // Efecto para cargar la sugerencia al montar el componente
  useEffect(() => {
    obtenerSugerenciaCorrelativo();
  }, []);

  // Función para aplicar la sugerencia de correlativo
  const aplicarSugerencia = () => {
    if (sugerenciaCorrelativo) {
      setFormData(prev => ({
        ...prev,
        numero_orden: sugerenciaCorrelativo
      }));
    }
  };

  // Función para manejar subida de imágenes
  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    console.log('Archivos seleccionados:', fileArray.length);

    // No comprimir: usar archivos originales
    const nuevasImagenes = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagenes((prev) => [...prev, ...nuevasImagenes]);
  };

  // Función para manejar input de archivos
  const handleFileInput = (e) => {
    handleImageUpload(e.target.files);
  };

  // Función para manejar drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  // Función para eliminar imagen
  const removeImage = (id) => {
    setImagenes(prev => prev.filter(img => img.id !== id));
  };

  // Función para cerrar el formulario
  const cerrarFormulario = () => {
    navigate("/ordenes"); // Redirige a la lista de órdenes
  };


  // Función para formatear teléfono automáticamente
  const formatearTelefono = (telefono) => {
    // Permitir números, guiones, paréntesis, espacios y signo +
    const telefonoLimpio = telefono.replace(/[^0-9\-\(\)\s\+]/g, '');
    
    // Si tiene 8 dígitos, formatear como 1234-5678 (número local)
    const numeros = telefonoLimpio.replace(/\D/g, '');
    if (numeros.length === 8) {
      return `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
    }
    
    // Si tiene 10 dígitos, formatear como 123-4567-8901
    if (numeros.length === 10) {
      return `${numeros.slice(0, 3)}-${numeros.slice(3, 7)}-${numeros.slice(7)}`;
    }
    
    // Si tiene 11 dígitos, asumir código de país de 3 dígitos
    if (numeros.length === 11) {
      const codigoPais = numeros.slice(0, 3);
      const numeroLocal = numeros.slice(3);
      return `(${codigoPais}) ${numeroLocal.slice(0, 4)}-${numeroLocal.slice(4)}`;
    }
    
    // Si tiene 12 dígitos, asumir código de país de 3 dígitos + 9 dígitos
    if (numeros.length === 12) {
      const codigoPais = numeros.slice(0, 3);
      const numeroLocal = numeros.slice(3);
      return `(${codigoPais}) ${numeroLocal.slice(0, 3)}-${numeroLocal.slice(3, 6)}-${numeroLocal.slice(6)}`;
    }
    
    // Si tiene 13 dígitos, asumir código de país de 3 dígitos + 10 dígitos
    if (numeros.length === 13) {
      const codigoPais = numeros.slice(0, 3);
      const numeroLocal = numeros.slice(3);
      return `(${codigoPais}) ${numeroLocal.slice(0, 3)}-${numeroLocal.slice(3, 6)}-${numeroLocal.slice(6)}`;
    }
    
    // Para otros casos, devolver tal como está (solo números, guiones, paréntesis y espacios)
    return telefonoLimpio;
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Para teléfono, solo limpiar caracteres no permitidos, no formatear automáticamente
    if (name === 'telefono') {
      // Permitir números, guiones, paréntesis, espacios y signo +
      const telefonoLimpio = value.replace(/[^0-9\-\(\)\s\+]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: telefonoLimpio
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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

  // Función para formatear teléfono cuando el usuario termine de escribir
  const handleTelefonoBlur = (e) => {
    const telefono = e.target.value;
    if (telefono) {
      const telefonoFormateado = formatearTelefono(telefono);
      setFormData(prev => ({
        ...prev,
        telefono: telefonoFormateado
      }));
    }
  };

  // Funciones de validación
  const validarCorreo = (correo) => {
    if (!correo) return true; // Correo es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(correo);
  };


  const validarFechas = (fechaRecepcion, fechaEntrega) => {
    // Si no hay fecha de recepción, no validar
    if (!fechaRecepcion) return { valido: true };
    
    // Si no hay fecha de entrega, es válido (fecha de entrega es opcional)
    if (!fechaEntrega) return { valido: true };
    
    // Convertir las fechas a objetos Date para comparar
    const fechaRec = new Date(fechaRecepcion);
    const fechaEnt = new Date(fechaEntrega);
    
    // Verificar si la fecha de entrega es anterior a la de recepción
    if (fechaEnt < fechaRec) {
      return { 
        valido: false, 
        mensaje: 'La fecha de entrega no puede ser anterior a la fecha de recepción.',
        titulo: 'Fecha de Entrega Inválida'
      };
    }
    
    return { valido: true };
  };

  const validarFormulario = () => {
    // Validar campos obligatorios individualmente
    if (!formData.numero_orden) {
      setPopup({
        isOpen: true,
        title: 'Campo Requerido',
        message: 'El campo "No de orden" es obligatorio.',
        type: 'warning',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
      return false;
    }

    if (!formData.paciente) {
      setPopup({
        isOpen: true,
        title: 'Campo Requerido',
        message: 'El campo "Paciente" es obligatorio.',
        type: 'warning',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
      return false;
    }

    if (!formData.telefono) {
      setPopup({
        isOpen: true,
        title: 'Campo Requerido',
        message: 'El campo "Teléfono" es obligatorio.',
        type: 'warning',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
      return false;
    }

    if (!formData.fecha_recepcion) {
      setPopup({
        isOpen: true,
        title: 'Campo Requerido',
        message: 'El campo "Fecha Recepción" es obligatorio.',
        type: 'warning',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
      return false;
    }

    // Validar correo electrónico
    if (formData.correo && !validarCorreo(formData.correo)) {
      setPopup({
        isOpen: true,
        title: 'Correo Inválido',
        message: 'Por favor ingrese un correo electrónico válido con formato: ejemplo@correo.com',
        type: 'warning',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
      return false;
    }


    // Validar fechas
    const validacionFechas = validarFechas(formData.fecha_recepcion, formData.fecha_entrega);
    if (!validacionFechas.valido) {
      setPopup({
        isOpen: true,
        title: validacionFechas.titulo,
        message: validacionFechas.mensaje,
        type: 'warning',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
      return false;
    }

    return true;
  };

  // Función para mostrar popup de confirmación
  const mostrarConfirmacion = () => {
    // Primero validar el formulario
    if (!validarFormulario()) {
      return;
    }

    setPopup({
      isOpen: true,
      title: 'Confirmar Guardado',
      message: '¿Desea guardar esta nueva orden de trabajo?',
      type: 'info',
      showButtons: true,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setPopup(prev => ({ ...prev, isOpen: false }));
        guardarOrden();
      },
      onCancel: () => setPopup(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Función para guardar la orden (lógica original)
  const guardarOrden = async () => {
    try {

      // Preparar datos para enviar
      const orderData = {
        correlativo: formData.numero_orden,
        paciente: formData.paciente,
        direccion: formData.direccion,
        correo: formData.correo,
        telefono: formData.telefono,
        fecha_recepcion: formData.fecha_recepcion,
        fecha_entrega: formData.fecha_entrega || null, // Enviar null si está vacío
        total: parseFloat(formData.total) || 0,
        adelanto: parseFloat(formData.adelanto) || 0,
        saldo: parseFloat(formData.saldo) || 0,
        observaciones: formData.observaciones,
        imagenes: imagenes.map(img => ({
          id: img.id,
          nombre: img.file.name,
          preview: img.preview
        }))
      };
      
      console.log('=== DATOS A ENVIAR ===');
      console.log('Correlativo a enviar:', orderData.correlativo);
      console.log('Tipo:', typeof orderData.correlativo);
      console.log('Longitud:', orderData.correlativo.length);
      console.log('Fecha recepción:', orderData.fecha_recepcion);
      console.log('Fecha entrega:', orderData.fecha_entrega);
      console.log('========================');

      const response = await createOrden(orderData);
      
      if (response.ok) {
        // Subir imágenes a la base de datos si existen
        if (imagenes.length > 0) {
          const ordenId = response.id; // El backend devuelve { ok: true, id: newOrderId }
          console.log('Subiendo imágenes para orden ID:', ordenId);
          
          try {
            // Subir cada imagen a la base de datos
            for (const imagen of imagenes) {
              await subirImagen(ordenId, imagen.file);
              console.log(`Imagen ${imagen.file.name} subida exitosamente`);
            }
            
            console.log('Todas las imágenes subidas exitosamente');
          } catch (error) {
            console.error('Error subiendo imágenes:', error);
            // Continuar aunque falle la subida de imágenes
          }
        }

        setPopup({
          isOpen: true,
          title: 'Registro Ingresado',
          message: 'La orden de trabajo ha sido creada exitosamente.',
          type: 'success',
          showButtons: true,
          confirmText: 'Aceptar',
          onConfirm: () => {
            setPopup(prev => ({ ...prev, isOpen: false }));
            navigate("/ordenes");
          }
        });
      } else {
        setPopup({
          isOpen: true,
          title: 'Error',
          message: 'Error al crear la orden. Intente nuevamente.',
          type: 'error',
          showButtons: true,
          confirmText: 'Aceptar',
          onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error al crear orden:', error);
      setPopup({
        isOpen: true,
        title: 'Error',
        message: 'Error al crear la orden. Intente nuevamente.',
        type: 'error',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  // Función para manejar el clic en guardar (ahora muestra confirmación)
  const handleGuardar = () => {
    mostrarConfirmacion();
  };

  return (
    <div className="orden-container">
       {/* Header con logo y número de orden */}
      <div className="orden-header">
        <div className="orden-logo">
          <img src={logo} alt="Logo Empresa" />
        </div>
        
        <div className="orden-no-section">
          <div className="orden-no">
            <label>No. Orden</label>
            <div className="orden-no-container">
              <div className="tooltip">
                <input 
                  type="text" 
                  name="numero_orden"
                  value={formData.numero_orden}
                  onChange={handleInputChange}
                  className="numero-orden-input"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    cursor: 'text'
                  }}
                />
                <span className="tooltiptext">Este campo es obligatorio</span>
              </div>
            </div>
          </div>
          
          {/* Sugerencia de correlativo - Ahora abajo del No de Orden */}
          {sugerenciaCorrelativo && (
            <div className="sugerencia-correlativo">
              <span className="sugerencia-texto">
                💡 Sugerencia: {sugerenciaCorrelativo}
              </span>
              <button 
                type="button"
                onClick={aplicarSugerencia}
                className="btn-aplicar-sugerencia"
                title="Hacer clic para usar esta sugerencia"
              >
                Usar
              </button>
            </div>
          )}
        </div>
      </div>

  {/* 🔹 Aquí colocamos el título centrado */}
     <Titulo text="Agregar Orden de Trabajo" size={32} className="titulo" />


      {/* Información del paciente */}
      <div className="orden-info">
        <div className="orden-row">
          <div className="orden-field paciente-field">
            <label>Paciente *</label>
            <div className="tooltip">
              <input 
                type="text" 
                name="paciente"
                value={formData.paciente}
                onChange={handleInputChange}
                placeholder="Nombre del paciente" 
              />
              <span className="tooltiptext">Este campo es obligatorio</span>
            </div>
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
          <div className="orden-field telefono-field">
            <label>Teléfono *</label>
            <div className="tooltip">
              <input 
                type="tel" 
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                onBlur={handleTelefonoBlur}
                placeholder="Número de teléfono" 
              />
              <span className="tooltiptext">Este campo es obligatorio</span>
            </div>
          </div>
        </div>

        <div className="orden-row">
          <div className="orden-field correo-field">
            <label>Correo (Opcional)</label>
            <input 
              type="email" 
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              placeholder="ejemplo@correo.com" 
            />
          </div>
          <div className="orden-field">
            <label>Fecha Recepción *</label>
            <input 
              type="date" 
              name="fecha_recepcion"
              value={formData.fecha_recepcion}
              onChange={handleInputChange}
              onFocus={(e) => e.target.showPicker()}
              required
            />
          </div>
          <div className="orden-field">
            <label>Fecha Entrega (Opcional)</label>
            <input 
              type="date" 
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleInputChange}
              onFocus={(e) => e.target.showPicker()}
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

      {/* Campo de Observaciones */}
      <div className="orden-observaciones" style={{ position: 'relative', zIndex: 5 }}>
        <div className="orden-field observaciones-field" style={{ position: 'relative', zIndex: 6 }}>
          <label>Observaciones</label>
          <textarea 
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            placeholder="Ingrese cualquier comentario o observación adicional..."
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
              minHeight: '80px',
              position: 'relative',
              zIndex: 10,
              backgroundColor: 'white',
              cursor: 'text',
              pointerEvents: 'auto',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#007bff';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ccc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Campo de Fotografías */}
      <div className="orden-fotografias">
        <h3>Fotografías (Opcional)</h3>
        <div className="fotografias-container">
          <div 
            className={`fotografias-upload ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label htmlFor="fotografias" className="fotografias-label">
              📷 Añadir Imágenes
            </label>
            <input
              id="fotografias"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <p className="fotografias-help">
              Arrastra y suelta o haz clic para seleccionar imágenes
            </p>
            <p className="fotografias-compression">
              Las imágenes se comprimirán automáticamente para optimizar el tamaño
            </p>
          </div>

          {/* Vista previa de imágenes */}
          {imagenes.length > 0 && (
            <div className="fotografias-preview">
              <h4>Vista previa ({imagenes.length} imágenes):</h4>
              <div className="imagenes-grid">
                {imagenes.map((imagen) => (
                  <div key={imagen.id} className="imagen-item">
                    <img 
                      src={imagen.preview} 
                      alt="Preview" 
                      className="imagen-preview"
                    />
                    <div className="imagen-info">
                      <span className="imagen-nombre">{imagen.file.name}</span>
                      <span className="imagen-tamaño">
                        {(imagen.file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeImage(imagen.id)}
                      className="imagen-remove"
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        showButtons={popup.showButtons}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        onConfirm={popup.onConfirm}
        onCancel={popup.onCancel}
        autoClose={popup.type === 'success' && !popup.showButtons}
        autoCloseDelay={2000}
      />
    </div>
  );
};

export default AgregarOrdenTrabajo;
