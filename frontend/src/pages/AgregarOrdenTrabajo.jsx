import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import "../styles/orden-trabajo.css";
import "../styles/vista-orden-trabajo.css";
import "../styles/popup.css";
import logo from "../assets/logo.jpg"; // Importamos el logo desde src
import Titulo from "../components/Titulo"; // Importamos el nuevo componente Titulo
import PopUp from "../components/PopUp";
import { createOrden, getOrdenes } from "../services/ordenTrabajoService";
import { subirImagen, comprimirImagen } from "../services/imagenesOrdenesService";


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
    saldo: ''
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
  
  // Estados para sugerencias de correlativos
  const [sugerenciasCorrelativo, setSugerenciasCorrelativo] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  
  // Cargar sugerencias de correlativos al montar el componente
  useEffect(() => {
    const cargarSugerenciasCorrelativo = async () => {
      try {
        setLoadingSugerencias(true);
        const response = await getOrdenes();
        if (response.ok && response.orders) {
          // Obtener el último correlativo para sugerir el siguiente
          const correlativos = response.orders
            .map(orden => orden.correlativo)
            .filter(correlativo => correlativo)
            .sort((a, b) => {
              // Ordenar numéricamente por el valor del correlativo
              const numA = parseInt(a.replace(/\D/g, '')) || 0;
              const numB = parseInt(b.replace(/\D/g, '')) || 0;
              return numB - numA; // Mayor a menor para obtener el más reciente
            });
          
          if (correlativos.length > 0) {
            const ultimoCorrelativo = correlativos[0];
            console.log('Correlativos encontrados:', correlativos);
            console.log('Último correlativo:', ultimoCorrelativo);
            
            // Extraer solo números del correlativo
            const numeros = ultimoCorrelativo.replace(/\D/g, '');
            if (numeros) {
              const numeroSiguiente = parseInt(numeros) + 1;
              
              // Determinar el número de ceros a la izquierda basado en el formato original
              const cerosIniciales = ultimoCorrelativo.match(/^0+/);
              const numCeros = cerosIniciales ? Math.max(0, cerosIniciales[0].length - 1) : 0;
              
              // Formatear con un cero menos que el original
              const siguienteFormateado = numeroSiguiente.toString().padStart(numCeros + numeros.length, '0');
              console.log('Siguiente correlativo sugerido:', siguienteFormateado);
              setSugerenciasCorrelativo([siguienteFormateado]);
            } else {
              // Si no tiene números, sugerir 001
              setSugerenciasCorrelativo(['001']);
            }
          } else {
            // Si no hay correlativos, sugerir empezar con 001
            setSugerenciasCorrelativo(['001']);
          }
        }
      } catch (error) {
        console.error('Error cargando sugerencias de correlativo:', error);
        // En caso de error, sugerir 001
        setSugerenciasCorrelativo(['001']);
      } finally {
        setLoadingSugerencias(false);
      }
    };
    
    cargarSugerenciasCorrelativo();
  }, []);

  // Función para comprimir imagen
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob comprimido
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Función para manejar subida de imágenes
  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    console.log('Archivos seleccionados:', fileArray.length);
    
    if (fileArray.length > 3) {
      setPopup({
        isOpen: true,
        title: 'Máximo 3 imágenes',
        message: 'Solo puedes subir máximo 3 fotografías.',
        type: 'warning'
      });
      return;
    }

    // Comprimir imágenes
    const compressedImages = [];
    for (const file of fileArray) {
      try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        
        compressedImages.push({
          id: Date.now() + Math.random(),
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile)
        });
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        // Si falla la compresión, usar imagen original
        compressedImages.push({
          id: Date.now() + Math.random(),
          file: file,
          preview: URL.createObjectURL(file)
        });
      }
    }

    setImagenes(prev => [...prev, ...compressedImages].slice(0, 3));
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
    if (!fechaRecepcion || !fechaEntrega) return true; // Si no hay fechas, no validar
    return fechaRecepcion !== fechaEntrega;
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
    if (!validarFechas(formData.fecha_recepcion, formData.fecha_entrega)) {
      setPopup({
        isOpen: true,
        title: 'Fechas Inválidas',
        message: 'La fecha de recepción no puede ser igual a la fecha de entrega.',
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
        fecha_entrega: formData.fecha_entrega,
        total: parseFloat(formData.total) || 0,
        adelanto: parseFloat(formData.adelanto) || 0,
        saldo: parseFloat(formData.saldo) || 0,
        imagenes: imagenes.map(img => ({
          id: img.id,
          nombre: img.file.name,
          preview: img.preview
        }))
      };

      const response = await createOrden(orderData);
      
      if (response.ok) {
        // Subir imágenes a la base de datos si existen
        if (imagenes.length > 0) {
          const ordenId = response.id; // El backend devuelve { ok: true, id: newOrderId }
          console.log('Subiendo imágenes para orden ID:', ordenId);
          
          try {
            // Subir cada imagen a la base de datos
            for (const imagen of imagenes) {
              const imagenComprimida = await comprimirImagen(imagen.file);
              const imagenFile = new File([imagenComprimida], imagen.file.name, {
                type: 'image/jpeg'
              });
              
              await subirImagen(ordenId, imagenFile);
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
          <img src={logo} alt="Logo Empresa" /> {/* Usamos la variable importada */}

        </div>
        <div className="orden-no">
          <label>No Orden *</label>
          <div className="orden-no-container">
            <div className="tooltip">
              <input 
                type="text" 
                name="numero_orden"
                value={formData.numero_orden}
                onChange={handleInputChange}
                placeholder="Ej: 003"
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
          
          {/* Sugerencias de correlativo */}
          {sugerenciasCorrelativo.length > 0 && (
            <div className="sugerencias-correlativo">
              <div className="sugerencias-header">
                <span className="sugerencias-icon">💡</span>
                <span className="sugerencias-title">Sugerencia: Ingrese el correlativo</span>
              </div>
              <div className="sugerencias-list">
                {sugerenciasCorrelativo.map((correlativo, index) => (
                  <button
                    key={index}
                    type="button"
                    className="sugerencia-item"
                    onClick={() => setFormData(prev => ({ ...prev, numero_orden: correlativo }))}
                    title={`Usar correlativo sugerido: ${correlativo}`}
                  >
                    #{correlativo}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {loadingSugerencias && (
            <div className="sugerencias-loading">
              <span className="loading-spinner"></span>
              <span>Cargando sugerencias...</span>
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
              📷 Añadir 3 Imágenes
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
              Máximo 3 imágenes • Arrastra y suelta o haz clic para seleccionar
            </p>
            <p className="fotografias-compression">
              Las imágenes se comprimirán automáticamente para optimizar el tamaño
            </p>
          </div>

          {/* Vista previa de imágenes */}
          {imagenes.length > 0 && (
            <div className="fotografias-preview">
              <h4>Vista previa ({imagenes.length}/3):</h4>
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
