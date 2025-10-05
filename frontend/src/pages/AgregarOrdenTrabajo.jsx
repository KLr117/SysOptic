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
  
  // Estado para número de orden sugerido
  const [siguienteNumeroOrden, setSiguienteNumeroOrden] = useState(null);
  const [loadingSugerencia, setLoadingSugerencia] = useState(true);

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

  // Obtener el siguiente número de orden
  useEffect(() => {
    const obtenerSiguienteNumeroOrden = async () => {
      try {
        setLoadingSugerencia(true);
        console.log('Obteniendo siguiente número de orden...');
        
        // Usar el servicio existente para obtener órdenes
        const response = await getOrdenes();
        console.log('Respuesta completa del servicio:', response);
        
        // El servicio devuelve un objeto con {ok: true, orders: Array}
        if (response && response.ok && response.orders && Array.isArray(response.orders) && response.orders.length > 0) {
          // Encontrar el ID más alto
          const maxId = Math.max(...response.orders.map(orden => orden.pk_id_orden || 0));
          const siguienteId = maxId + 1;
          console.log(`Último ID encontrado: ${maxId}, siguiente sugerencia: ${siguienteId}`);
          console.log('IDs encontrados:', response.orders.map(orden => orden.pk_id_orden));
          setSiguienteNumeroOrden(siguienteId);
        } else {
          // Si no hay órdenes, empezar con 1
          console.log('No hay órdenes existentes, empezando con 1');
          console.log('Response.ok:', response?.ok, 'Orders length:', response?.orders?.length);
          setSiguienteNumeroOrden(1);
        }
      } catch (error) {
        console.error('Error obteniendo siguiente número de orden:', error);
        // Fallback: usar timestamp como sugerencia
        const fallbackId = Math.floor(Date.now() / 1000) % 10000;
        console.log(`Usando fallback ID: ${fallbackId}`);
        setSiguienteNumeroOrden(fallbackId);
      } finally {
        setLoadingSugerencia(false);
      }
    };

    obtenerSiguienteNumeroOrden();
  }, []);

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
          <div className="orden-no-container">
            <input 
              type="text" 
              name="numero_orden"
              value={formData.numero_orden}
              onChange={handleInputChange}
              placeholder="Ej: 003"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                cursor: 'text'
              }}
            />
            <div className="sugerencia-orden">
              {loadingSugerencia ? (
                <span className="sugerencia-loading">🔄 Obteniendo siguiente número...</span>
              ) : (
                <div className="sugerencia-contenido">
                  <span className="sugerencia-texto">
                    💡 Sugerencia: <strong>{siguienteNumeroOrden}</strong>
                  </span>
                  <button 
                    type="button"
                    className="btn-usar-sugerencia"
                    onClick={() => setFormData(prev => ({ ...prev, numero_orden: siguienteNumeroOrden.toString() }))}
                  >
                    Usar este número
                  </button>
                </div>
              )}
            </div>
          </div>
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
        autoClose={popup.type === 'success'}
        autoCloseDelay={2000}
      />
    </div>
  );
};

export default AgregarOrdenTrabajo;
