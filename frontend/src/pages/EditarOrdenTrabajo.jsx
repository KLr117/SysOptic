import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/vista-orden-trabajo.css";
import "../styles/orden-trabajo.css";
import "../styles/popup.css";
import logo from "../assets/logo.jpg";
import Titulo from "../components/Titulo";
import PopUp from "../components/PopUp";
import { getOrdenById, updateOrden } from "../services/ordenTrabajoService";

const EditarOrdenTrabajo = () => {
  const { id } = useParams(); // Capturar el ID de la orden
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  

  // Estados para PopUp
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Cargar datos de la orden desde el backend
  useEffect(() => {
    const cargarOrden = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrdenById(id);
        
        if (response.ok) {
          const orden = response.order;
          
          // Formatear fechas para inputs de tipo date (YYYY-MM-DD)
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };
          
          setFormData({
            paciente: orden.paciente || '',
            direccion: orden.direccion || '',
            correo: orden.correo || '',
            telefono: orden.telefono || '',
            fecha_recepcion: formatDateForInput(orden.fecha_recepcion),
            fecha_entrega: formatDateForInput(orden.fecha_entrega),
            total: orden.total || '',
            adelanto: orden.adelanto || '',
            saldo: orden.saldo || ''
          });
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


  // Función para cerrar el formulario
  const cerrarFormulario = () => {
    navigate("/ordenes");
  };


  // Función para comprimir imagen
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Función para manejar subida de nuevas imágenes
  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    console.log('Archivos seleccionados para edición:', fileArray.length);
    
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
        compressedImages.push({
          id: Date.now() + Math.random(),
          file: file,
          preview: URL.createObjectURL(file)
        });
      }
    }

    setNuevasImagenes(prev => [...prev, ...compressedImages].slice(0, 3));
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

  // Función para eliminar imagen existente
  const removeImagenExistente = (index) => {
    setImagenesOrden(prev => prev.filter((_, i) => i !== index));
  };

  // Función para eliminar nueva imagen
  const removeNuevaImagen = (id) => {
    setNuevasImagenes(prev => prev.filter(img => img.id !== id));
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para guardar los cambios
  const handleGuardar = async () => {
    try {
      setSaving(true);
      
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

      const response = await updateOrden(id, orderData);
      
      if (response.ok) {
        setPopup({
          isOpen: true,
          title: 'Registro Actualizado',
          message: 'La orden de trabajo ha sido actualizada exitosamente.',
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
          message: 'Error al actualizar la orden. Intente nuevamente.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      setPopup({
        isOpen: true,
        title: 'Error',
        message: 'Error al actualizar la orden. Intente nuevamente.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="orden-container">
        <div className="text-center py-8">
          <p>Cargando orden...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="orden-container">
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

  return (
    <div className="orden-container">
       {/* Header con logo y número de orden */}
      <div className="orden-header">
        <div className="orden-logo">
          <img src={logo} alt="Logo Empresa" />
        </div>
        <div className="orden-no">
          <label>No Orden</label>
          <p>{formData.paciente ? `Editando orden ${id}` : 'Cargando...'}</p>
        </div>
      </div>

      {/* Título centrado */}
      <Titulo text="Editar Orden de Trabajo" size={32} className="titulo" />


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
        <button 
          className="btn-save" 
          onClick={handleGuardar}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button className="btn-close" onClick={cerrarFormulario}>
          Cerrar
        </button>
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

export default EditarOrdenTrabajo;
