// ===============   WENDYs    ===============
//en la base de datos iniciar en la linea 297 en el ldd modificacion con alter table 
import React, { useState, useEffect } from "react";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/vista-expedientes.css";
import "../styles/popup.css";
import "../styles/zoom-modal.css";
import Titulo from "../components/Titulo";
import Button from "../components/Button";
import {
  getExpedientes,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  getLastCorrelativoExpediente,
} from "../services/expedientesService";
// Importaciones de imágenes removidas - ahora usamos el campo fotos directamente

export default function Expedientes() {
  const columns = [
    "#",
    "No. Correlativo",
    "Nombre",
    "Teléfono",
    "Dirección",
    "Email",
    "Fecha Registro",
    "Foto",
    "Acciones",
    "Estado",
  ];

  // 🔹 Estados
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("fecha_registro");
  const [sortDirection, setSortDirection] = useState("desc");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    correlativo: "",
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
    fecha_registro: "", // ✅ Sin fecha sugerida - el cliente debe ingresarla
    foto: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState(1);
  const [expedienteVisualizar, setExpedienteVisualizar] = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [fotoMensaje, setFotoMensaje] = useState(false);
  const [showConfirmSubirOtra, setShowConfirmSubirOtra] = useState(false);
  const [showConfirmEliminarFoto, setShowConfirmEliminarFoto] = useState(false);
  const [fotoIndexToDelete, setFotoIndexToDelete] = useState(null);
  const [showConfirmEliminarFotoTabla, setShowConfirmEliminarFotoTabla] = useState(false);
  const [expedienteFotoToDelete, setExpedienteFotoToDelete] = useState(null);
  const [showConfirmEliminarExpediente, setShowConfirmEliminarExpediente] = useState(false);
  const [expedienteToDelete, setExpedienteToDelete] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // "success", "error", "warning", "info"
  
   // Estados para sugerencias de correlativo
  const [sugerenciasCorrelativo, setSugerenciasCorrelativo] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [ultimoCorrelativoIngresado, setUltimoCorrelativoIngresado] = useState(null);
   
   // Estados para modal de imágenes
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalImage, setModalImage] = useState(null);
   
   // Estados para popup de confirmación de eliminación de foto
   const [showConfirmEliminarFotoPopup, setShowConfirmEliminarFotoPopup] = useState(false);
   const [fotoToDeleteInfo, setFotoToDeleteInfo] = useState(null);
   
   // Estados para modal de zoom de imágenes
   const [showZoomModal, setShowZoomModal] = useState(false);
   const [zoomImage, setZoomImage] = useState(null);
   const [zoomLevel, setZoomLevel] = useState(1);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // 🔹 Mostrar popup
  const mostrarPopup = (mensaje, tipo = "success") => {
    setPopupMessage(mensaje);
    setPopupType(tipo);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

   // 🔹 Funciones para modal de imágenes
   const openImageModal = (imagen, expedienteId) => {
     setModalImage({
       ...imagen,
       expedienteId: expedienteId
     });
     setIsModalOpen(true);
   };

   const closeImageModal = () => {
     setIsModalOpen(false);
     setModalImage(null);
  };

  // 🔹 Funciones para modal de zoom
  const openZoomModal = (imagen, expedienteId) => {
    setZoomImage({
      ...imagen,
      expedienteId: expedienteId
    });
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
    setShowZoomModal(true);
  };

  const closeZoomModal = () => {
    setShowZoomModal(false);
    setZoomImage(null);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleImageDrag = (e) => {
    if (zoomLevel > 1 && e.buttons === 1) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (e.clientX - rect.left - centerX) / centerX;
      const deltaY = (e.clientY - rect.top - centerY) / centerY;
      
      setZoomPosition(prev => ({
        x: Math.max(-50, Math.min(50, prev.x + deltaX * 10)),
        y: Math.max(-50, Math.min(50, prev.y + deltaY * 10))
      }));
    }
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // 🔹 Función para cargar fotos desde localStorage
  const cargarFotosDesdeCache = (expedientes) => {
    return expedientes.map(exp => {
      const cacheKey = `expediente_fotos_${exp.pk_id_expediente}`;
      const fotosCache = localStorage.getItem(cacheKey);
      
      if (fotosCache) {
        try {
          const fotosParseadas = JSON.parse(fotosCache);
          console.log(`Fotos cargadas desde cache para expediente ${exp.pk_id_expediente}:`, fotosParseadas);
          return {
            ...exp,
            foto: fotosParseadas,
            imagenes: fotosParseadas.length > 0
          };
        } catch (error) {
          console.error('Error parseando fotos desde cache:', error);
          return exp;
        }
      }
      
      // Si no hay cache pero hay fotos en el backend, usar las del backend y guardarlas en cache
      if (exp.foto && exp.foto.length > 0) {
        console.log(`Fotos encontradas en backend para expediente ${exp.pk_id_expediente}, guardando en cache:`, exp.foto);
        guardarFotosEnCache(exp.pk_id_expediente, exp.foto);
        return exp;
      }
      
      return exp;
    });
  };

  // 🔹 Función para guardar fotos en localStorage
  const guardarFotosEnCache = (expedienteId, fotos) => {
    const cacheKey = `expediente_fotos_${expedienteId}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(fotos));
      console.log(`Fotos guardadas en cache para expediente ${expedienteId}:`, fotos);
    } catch (error) {
      console.error('Error guardando fotos en cache:', error);
    }
  };

  // 🔹 Función para limpiar fotos del cache
  const limpiarFotosDelCache = (expedienteId) => {
    const cacheKey = `expediente_fotos_${expedienteId}`;
    try {
      localStorage.removeItem(cacheKey);
      console.log(`Fotos eliminadas del cache para expediente ${expedienteId}`);
    } catch (error) {
      console.error('Error eliminando fotos del cache:', error);
    }
  };

  // 🔹 Cargar expedientes
  useEffect(() => {
    const cargarExpedientes = async () => {
      try {
        setLoading(true);
        const data = await getExpedientes();
        // Validar que data sea un array antes de establecerlo
        if (Array.isArray(data)) {
          // Cargar fotos desde cache local
          const expedientesConCache = cargarFotosDesdeCache(data);
          setExpedientes(expedientesConCache);
        } else {
          console.warn("getExpedientes no retornó un array:", data);
          setExpedientes([]);
          setError("Error: Los datos recibidos no tienen el formato correcto");
          mostrarPopup("Error al cargar expedientes: formato de datos incorrecto", "error");
        }
      } catch (err) {
        console.error("Error al cargar expedientes:", err);
        setExpedientes([]); // Asegurar que siempre sea un array
        setError("Error al cargar expedientes");
        mostrarPopup("Error al cargar expedientes", "error");
      } finally {
        setLoading(false);
      }
    };
    cargarExpedientes();
  }, []);

  // 🔹 Monitorear cambios en el ordenamiento
  useEffect(() => {
    console.log('🔄 Estados de ordenamiento cambiaron:', { sortField, sortDirection });
  }, [sortField, sortDirection]);

  // 🔹 Cargar sugerencias de correlativo usando el nuevo endpoint
  useEffect(() => {
    const cargarSugerenciasCorrelativo = async () => {
      try {
        setLoadingSugerencias(true);
        
        // Si hay un último correlativo ingresado, usarlo como base
        if (ultimoCorrelativoIngresado) {
          const numeroIngresado = parseInt(ultimoCorrelativoIngresado);
          const siguienteSugerencia = (numeroIngresado + 1).toString();
          setSugerenciasCorrelativo([siguienteSugerencia]);
          console.log('Sugerencia basada en último dato ingresado:', siguienteSugerencia);
          return;
        }
        
        // Usar el nuevo endpoint del backend para obtener el siguiente correlativo
        const siguienteCorrelativo = await getLastCorrelativoExpediente();
        console.log('Siguiente correlativo obtenido del backend:', siguienteCorrelativo);
        
        // El backend ya devuelve el siguiente número en la secuencia
        setSugerenciasCorrelativo([siguienteCorrelativo.toString()]);
        console.log('Siguiente correlativo sugerido:', siguienteCorrelativo);
       } catch (error) {
         console.error('Error cargando sugerencias de correlativo:', error);
         // En caso de error, sugerir 1
         setSugerenciasCorrelativo(['1']);
       } finally {
        setLoadingSugerencias(false);
      }
    };
    
     cargarSugerenciasCorrelativo();
   }, [ultimoCorrelativoIngresado]);

   // 🔹 Función para formatear fecha para input type="date" (YYYY-MM-DD)
   const formatearFechaParaInput = (fecha) => {
     if (!fecha) return '';
     
     try {
       // Si viene en formato ISO completo
       if (fecha.includes('T')) {
         const fechaObj = new Date(fecha);
         const año = fechaObj.getFullYear();
         const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
         const dia = fechaObj.getDate().toString().padStart(2, '0');
         return `${año}-${mes}-${dia}`;
       }
       
       // Si viene en formato DD/MM/YYYY
       if (fecha.includes('/')) {
         const [dia, mes, año] = fecha.split('/');
         return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
       }
       
       // Si viene en formato YYYY-MM-DD, devolverlo tal como está
       if (fecha.includes('-')) {
         return fecha;
       }
       
       // Si es una fecha válida, convertirla
       const fechaObj = new Date(fecha);
       if (!isNaN(fechaObj.getTime())) {
         const año = fechaObj.getFullYear();
         const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
         const dia = fechaObj.getDate().toString().padStart(2, '0');
         return `${año}-${mes}-${dia}`;
       }
       
       return fecha; // Devolver fecha original si no se puede convertir
     } catch (error) {
       console.error('Error al formatear fecha para input:', error);
       return fecha; // Devolver fecha original si hay error
     }
   };

   // 🔹 Función para formatear fecha
   const formatearFecha = (fecha) => {
     if (!fecha) return '';
     
     try {
       // Si viene en formato ISO completo
       if (fecha.includes('T')) {
         const fechaObj = new Date(fecha);
         const dia = fechaObj.getDate().toString().padStart(2, '0');
         const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
         const año = fechaObj.getFullYear();
         return `${dia}/${mes}/${año}`;
       }
       
       // Si viene en formato YYYY-MM-DD
       if (fecha.includes('-')) {
         const [año, mes, dia] = fecha.split('-');
         return `${dia}/${mes}/${año}`;
       }
       
       // Si ya está en formato DD/MM/YYYY, devolverlo tal como está
       return fecha;
     } catch (error) {
       console.error('Error al formatear fecha:', error);
       return fecha; // Devolver fecha original si hay error
     }
   };

   // 🔹 Función de redimensionamiento de imágenes
   const resizeImage = (file, maxWidth = 1200, maxHeight = 900) => {
     return new Promise((resolve) => {
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       const img = new Image();
       
       img.onload = () => {
         // Calcular nuevas dimensiones manteniendo proporción
         let { width, height } = img;
         if (width > maxWidth || height > maxHeight) {
           const ratio = Math.min(maxWidth / width, maxHeight / height);
           width *= ratio;
           height *= ratio;
         }
         
         canvas.width = width;
         canvas.height = height;
         ctx.drawImage(img, 0, 0, width, height);
         
         // Convertir a Base64 con calidad 0.8 (80%)
         const base64 = canvas.toDataURL('image/jpeg', 0.8);
         resolve(base64);
       };
       
       img.src = URL.createObjectURL(file);
     });
   };

  // 🔹 Manejo de formulario
  // Función para eliminar una foto específica
  const eliminarFoto = (index) => {
    // Guardar el índice de la foto a eliminar
    setFotoIndexToDelete(index);
    // Mostrar modal de confirmación
    setShowConfirmEliminarFoto(true);
  };

  // Función para confirmar eliminación de foto
  const confirmarEliminarFoto = () => {
    if (fotoIndexToDelete !== null) {
      setFormData(prev => ({
        ...prev,
        foto: prev.foto.filter((_, i) => i !== fotoIndexToDelete)
      }));
      mostrarPopup("Foto eliminada correctamente", "success");
      // Desactivar el mensaje de subir otra foto
      setFotoMensaje(false);
    }
    setShowConfirmEliminarFoto(false);
    setFotoIndexToDelete(null);
  };

  // Función para eliminar foto desde la tabla
  const eliminarFotoTabla = (expedienteId, fotoIndex) => {
    // Obtener información del expediente y la foto
    const expediente = expedientes.find(exp => exp.pk_id_expediente === expedienteId);
    if (expediente && expediente.foto && expediente.foto.length > fotoIndex) {
      setFotoToDeleteInfo({ 
        expedienteId, 
        fotoIndex, 
        expedienteNombre: expediente.nombre,
        fotoNumero: fotoIndex + 1
      });
      setShowConfirmEliminarFotoPopup(true);
    }
  };

  // Función para confirmar eliminación de foto desde tabla usando el sistema actual
  const confirmarEliminarFotoTabla = async () => {
    if (fotoToDeleteInfo) {
      const { expedienteId, fotoIndex } = fotoToDeleteInfo;
      
      try {
        // Obtener el expediente actual
        const expediente = expedientes.find(exp => exp.pk_id_expediente === expedienteId);
        
        if (expediente && expediente.foto && expediente.foto.length > fotoIndex) {
          // Crear nuevo array sin la foto eliminada
          const nuevasFotos = expediente.foto.filter((_, i) => i !== fotoIndex);
          
          // Actualizar el expediente en el backend
          const expedienteData = {
            ...expediente,
            fotos: nuevasFotos
          };
          
          await updateExpediente(expedienteId, expedienteData);
          
          // Guardar fotos actualizadas en cache local
          guardarFotosEnCache(expedienteId, nuevasFotos);
          
          // Actualizar el estado local
          setExpedientes(prev => prev.map(exp => 
            exp.pk_id_expediente === expedienteId 
              ? { ...exp, foto: nuevasFotos, imagenes: nuevasFotos.length > 0 }
              : exp
          ));
          
          mostrarPopup("Foto eliminada correctamente", "success");
        }
      } catch (error) {
        console.error('Error al eliminar foto:', error);
        mostrarPopup("Error al eliminar la foto", "error");
      }
    }
    
    setShowConfirmEliminarFotoPopup(false);
    setFotoToDeleteInfo(null);
  };

  // Función para manejar la carga de fotos usando el nuevo sistema
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    if (formData.foto.length >= 2) {
      mostrarPopup("Solo se permiten máximo 2 fotos", "warning");
      return;
    }
    
    const file = files[0];
    
    // Verificar tamaño original
    if (file.size > 2 * 1024 * 1024) { // 2MB
      mostrarPopup("La imagen es muy grande. Se redimensionará automáticamente.", "info");
    }
    
    // Redimensionar antes de convertir
    try {
      const base64 = await resizeImage(file, 1200, 900);
      setFormData(prev => ({
        ...prev,
        foto: [...prev.foto, base64]
      }));
      setFotoMensaje(true);
    } catch (error) {
      console.error('Error al redimensionar imagen:', error);
      mostrarPopup("Error al procesar la imagen", "error");
    }

    // Limpiar el input para permitir cargar la misma imagen otra vez
    e.target.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    console.log('handleInputChange llamado:', { name, value, files: !!files });
    
    // Validación especial para el campo correlativo - solo números
    if (name === "correlativo") {
      // Permitir solo números
      const soloNumeros = value.replace(/[^0-9]/g, '');
      console.log('Campo correlativo:', { original: value, filtrado: soloNumeros });
      
      // Actualizar el último correlativo ingresado
      if (soloNumeros && soloNumeros.length > 0) {
        setUltimoCorrelativoIngresado(soloNumeros);
        // Generar sugerencia basada en el último dato ingresado
        const numeroIngresado = parseInt(soloNumeros);
        const siguienteSugerencia = (numeroIngresado + 1).toString();
        setSugerenciasCorrelativo([siguienteSugerencia]);
        console.log('Sugerencia actualizada basada en último dato:', siguienteSugerencia);
      }
      
      setFormData({ ...formData, [name]: soloNumeros });
      return;
    }
     
     // Validación especial para el campo nombre - solo letras y espacios
     if (name === "nombre") {
       // Permitir solo letras, espacios y acentos
       const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
       console.log('Campo nombre:', { original: value, filtrado: soloLetras });
       setFormData({ ...formData, [name]: soloLetras });
       return;
     }
     
     // Validación especial para el campo teléfono - formato internacional
     if (name === "telefono") {
       // Permitir números, +, (), espacios y guiones
       const telefonoFiltrado = value.replace(/[^0-9+\-() ]/g, '');
       console.log('Campo teléfono:', { original: value, filtrado: telefonoFiltrado });
       setFormData({ ...formData, [name]: telefonoFiltrado });
       return;
     }
    
     console.log('Actualizando campo:', { name, value });
     setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (fotoMensaje && formData.foto.length < 2) {
      setShowConfirmSubirOtra(true);
    }
  }, [fotoMensaje, formData.foto.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        // Actualizar expediente con imágenes en el campo fotos
        const expedienteData = { ...formData };
        
        // Convertir imágenes base64 a array para almacenar en el campo fotos
        if (formData.foto && formData.foto.length > 0) {
          expedienteData.fotos = formData.foto; // Enviar las imágenes base64
        } else {
          expedienteData.fotos = []; // Array vacío si no hay imágenes
        }
        
        // Remover el campo foto del objeto principal
        delete expedienteData.foto;
        
        console.log('=== ACTUALIZANDO EXPEDIENTE ===');
        console.log('ID:', editando);
        console.log('Expediente data:', expedienteData);
        console.log('================================');
        
        await updateExpediente(editando, expedienteData);
        
        // Guardar fotos en cache local
        if (expedienteData.fotos && expedienteData.fotos.length > 0) {
          guardarFotosEnCache(editando, expedienteData.fotos);
        }
        
        setExpedientes(
          expedientes.map((exp) =>
            exp.pk_id_expediente === editando
              ? { 
                  ...expedienteData, 
                  pk_id_expediente: editando,
                  foto: expedienteData.fotos || [] // ✅ Agregar campo foto para la tabla
                }
              : exp
          )
        );
        mostrarPopup("Expediente actualizado correctamente", "success");
        setEditando(null);
      } else {
        // Crear nuevo expediente con imágenes en el campo fotos
        const expedienteData = { ...formData };
        
        // Convertir imágenes base64 a array para almacenar en el campo fotos
        if (formData.foto && formData.foto.length > 0) {
          expedienteData.fotos = formData.foto; // Enviar las imágenes base64
        } else {
          expedienteData.fotos = []; // Array vacío si no hay imágenes
        }
        
        // Remover el campo foto del objeto principal
        delete expedienteData.foto;
        
        console.log('=== DATOS A ENVIAR AL BACKEND ===');
        console.log('Expediente data:', expedienteData);
        console.log('==================================');
        
        const newExp = await createExpediente(expedienteData);
        
        // Guardar fotos en cache local
        if (expedienteData.fotos && expedienteData.fotos.length > 0) {
          guardarFotosEnCache(newExp.pk_id_expediente, expedienteData.fotos);
        }
        
        setExpedientes([
          ...expedientes,
          { 
            ...expedienteData, 
            pk_id_expediente: newExp.pk_id_expediente,
            foto: expedienteData.fotos || [] // ✅ Agregar campo foto para la tabla
          },
        ]);
        mostrarPopup("Expediente guardado correctamente", "success");
      }
      setFormData({
        correlativo: "",
        nombre: "",
        telefono: "",
        direccion: "",
        email: "",
        fecha_registro: "",
        foto: [],
      });
      setMostrarFormulario(false);
    } catch (err) {
      console.error(err);
      mostrarPopup("Error al guardar expediente", "error");
    }
  };

  const handleEditar = async (exp) => {
    console.log('Datos del expediente a editar:', exp);
    console.log('Fecha original:', exp.fecha_registro);
    console.log('Tipo de fecha:', typeof exp.fecha_registro);
    
    const fechaFormateada = formatearFechaParaInput(exp.fecha_registro);
    console.log('Fecha formateada para input:', fechaFormateada);
    
    // Usar las imágenes del campo foto del expediente
    const imagenesExpediente = exp.foto || [];
    console.log('Imágenes cargadas para edición:', imagenesExpediente);
    
    setFormData({
      correlativo: exp.correlativo,
      nombre: exp.nombre,
      telefono: exp.telefono,
      direccion: exp.direccion,
      email: exp.email,
      fecha_registro: fechaFormateada,
      foto: imagenesExpediente,
    });
    setEditando(exp.pk_id_expediente);
    setMostrarFormulario(true);
  };

  const handleEliminar = (id) => {
    setExpedienteToDelete(id);
    setShowConfirmEliminarExpediente(true);
  };

  // Función para confirmar eliminación de expediente
  const confirmarEliminarExpediente = async () => {
    if (expedienteToDelete) {
      try {
        await deleteExpediente(expedienteToDelete);
        
        // Limpiar fotos del cache local
        limpiarFotosDelCache(expedienteToDelete);
        
        setExpedientes(expedientes.filter((exp) => exp.pk_id_expediente !== expedienteToDelete));
        mostrarPopup("Expediente eliminado correctamente", "success");
      } catch (err) {
        console.error(err);
        mostrarPopup("Error al eliminar expediente", "error");
      }
    }
    setShowConfirmEliminarExpediente(false);
    setExpedienteToDelete(null);
  };

  const handleCancelar = () => {
    setFormData({
      correlativo: "",
      nombre: "",
      telefono: "",
      direccion: "",
      email: "",
      fecha_registro: "", // ✅ Sin fecha sugerida - el cliente debe ingresarla
      foto: [],
    });
    setEditando(null);
    setMostrarFormulario(false);
  };

  // Función para mostrar flecha de ordenamiento
  const renderSortArrow = (field) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';

  // Función para manejar el cambio del select de ordenamiento
  const handleSortChange = (option) => {
    console.log('🎯 handleSortChange llamado con:', option);
    console.log('🎯 Estados actuales:', { sortField, sortDirection });
    
    switch (option) {
      case 'fecha_registro-desc':
        console.log('📅 Configurando ordenamiento por fecha descendente');
        setSortField('fecha_registro');
        setSortDirection('desc');
        break;
      case 'fecha_registro-asc':
        console.log('📅 Configurando ordenamiento por fecha ascendente');
        setSortField('fecha_registro');
        setSortDirection('asc');
        break;
      case 'id-asc':
        console.log('🆔 Configurando ordenamiento por ID ascendente');
        setSortField('id');
        setSortDirection('asc');
        break;
      case 'id-desc':
        console.log('🆔 Configurando ordenamiento por ID descendente');
        setSortField('id');
        setSortDirection('desc');
        break;
      case 'nombre-asc':
        console.log('📝 Configurando ordenamiento por nombre ascendente');
        setSortField('nombre');
        setSortDirection('asc');
        break;
      case 'nombre-desc':
        console.log('📝 Configurando ordenamiento por nombre descendente');
        setSortField('nombre');
        setSortDirection('desc');
        break;
      default:
        console.log('⚠️ Opción no reconocida:', option);
        setSortField('fecha_registro');
        setSortDirection('desc');
    }
  };
  
    // Estados para PopUp
    const [popup, setPopup] = useState({
      isOpen: false,
      title: '',
      message: '',
      type: 'success'
    });

  // 🔹 Filtrado y ordenamiento
  const filtro = search.trim().toLowerCase();
  console.log('🔍 Búsqueda activa:', filtro);
  console.log('📊 Total expedientes:', expedientes.length);
  console.log('🔄 Estado de ordenamiento:', { sortField, sortDirection });
   
   // Validar que expedientes sea un array antes de usar spread operator
   const expedientesFiltrados = Array.isArray(expedientes) ? [...expedientes] : []
    .filter(
      (exp) => {
        const match = !filtro ||
          (exp.nombre || "").toLowerCase().includes(filtro) ||
          (exp.telefono || "").toLowerCase().includes(filtro) ||
          (exp.email || "").toLowerCase().includes(filtro) ||
          (exp.correlativo || "").toLowerCase().includes(filtro) ||
          (exp.pk_id_expediente || "").toString().toLowerCase().includes(filtro); // ✅ Agregado búsqueda por ID
        
        if (filtro && match) {
          console.log('✅ Expediente encontrado:', {
            id: exp.pk_id_expediente,
            nombre: exp.nombre,
            email: exp.email,
            telefono: exp.telefono,
            correlativo: exp.correlativo
          });
        }
        return match;
      }
    )
    .sort((a, b) => {
      console.log('🔄 Ordenando por:', sortField, 'dirección:', sortDirection);
      console.log('📊 Datos de ejemplo:', { 
        a: { id: a.pk_id_expediente, nombre: a.nombre, fecha: a.fecha_registro },
        b: { id: b.pk_id_expediente, nombre: b.nombre, fecha: b.fecha_registro }
      });
      
      // Ordenamiento por ID (pk_id_expediente)
      if (sortField === "id") {
        const idA = parseInt(a.pk_id_expediente) || 0;
        const idB = parseInt(b.pk_id_expediente) || 0;
        const result = sortDirection === "asc" ? idA - idB : idB - idA;
        console.log('📊 Resultado ID:', { idA, idB, result });
        return result;
      }
      
      // Ordenamiento por Nombre
      if (sortField === "nombre") {
        const nombreA = (a.nombre || "").toLowerCase().trim();
        const nombreB = (b.nombre || "").toLowerCase().trim();
        const result = sortDirection === "asc" 
          ? nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' })
          : nombreB.localeCompare(nombreA, 'es', { sensitivity: 'base' });
        console.log('📊 Resultado Nombre:', { nombreA, nombreB, result });
        return result;
      }
      
      // Ordenamiento por Fecha
      if (sortField === "fecha_registro") {
        // Manejar fechas vacías o inválidas
        const fechaA = a.fecha_registro ? new Date(a.fecha_registro) : new Date('1900-01-01');
        const fechaB = b.fecha_registro ? new Date(b.fecha_registro) : new Date('1900-01-01');
        
        // Verificar que las fechas sean válidas
        const fechaAValida = !isNaN(fechaA.getTime());
        const fechaBValida = !isNaN(fechaB.getTime());
        
        if (!fechaAValida && !fechaBValida) {
          console.log('📊 Resultado Fecha: Ambas fechas inválidas');
          return 0;
        }
        if (!fechaAValida) {
          const result = sortDirection === "asc" ? 1 : -1;
          console.log('📊 Resultado Fecha: A inválida', { result });
          return result;
        }
        if (!fechaBValida) {
          const result = sortDirection === "asc" ? -1 : 1;
          console.log('📊 Resultado Fecha: B inválida', { result });
          return result;
        }
        
        const result = sortDirection === "asc" ? fechaA - fechaB : fechaB - fechaA;
        console.log('📊 Resultado Fecha:', { fechaA, fechaB, result });
        return result;
      }
      
      console.log('⚠️ Campo de ordenamiento no reconocido:', sortField);
      return 0;
    });

  // 🔹 Paginación
  const totalPages = Math.ceil(expedientesFiltrados.length / pageSize);
  const currentPageClamped = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (currentPageClamped - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, expedientesFiltrados.length);
  const expedientesPaginados = expedientesFiltrados.slice(startIndex, endIndex);

  const commitPageInput = () => {
    let val = parseInt(pageInput, 10);
    if (!Number.isInteger(val) || val < 1 || val > totalPages) {
      setPageInput(String(currentPage));
      return;
    }
    setCurrentPage(val);
  };
  const handlePageInput = (e) => {
    const val = parseInt(e.currentTarget.value, 10);
    setPageInput(e.currentTarget.value);
    if (Number.isInteger(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val);
    }
  };

  // 🔹 Navegación fotos
  const handleNextFoto = () => {
    if (!expedienteVisualizar?.foto) return;
    setFotoIndex((prev) => (prev + 1) % expedienteVisualizar.foto.length);
    setFotoAmpliada(expedienteVisualizar.foto[(fotoIndex + 1) % expedienteVisualizar.foto.length]);
  };
  const handlePrevFoto = () => {
    if (!expedienteVisualizar?.foto) return;
    const prevIndex = (fotoIndex - 1 + expedienteVisualizar.foto.length) % expedienteVisualizar.foto.length;
    setFotoIndex(prevIndex);
    setFotoAmpliada(expedienteVisualizar.foto[prevIndex]);
  };

  if (loading) return <div className="text-center p-4">Cargando expedientes...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="container-expedientes">
      <h2>Gestión de Expedientes</h2>

      {/* 🔹 POPUP DE NOTIFICACIONES - VERSIÓN MEJORADA */}
{showPopup && (
  <div className="popup-overlay">
    <div className="popup-container">
      <div className={`popup-header popup-${popupType}`}>
        <div className="popup-icon">
          {popupType === "success" && "✓"}
          {popupType === "error" && "✕"}
          {popupType === "warning" && "!"}
          {popupType === "info" && "i"}
        </div>
        <h3 className="popup-title">
          {popupType === "success" && "Éxito"}
          {popupType === "error" && "Error"}
          {popupType === "warning" && "Advertencia"}
          {popupType === "info" && "Información"}
        </h3>
        <button 
          className="popup-close"
          onClick={() => setShowPopup(false)}
        >
          ×
        </button>
      </div>
      <div className="popup-body">
        <p className="popup-message">{popupMessage}</p>
      </div>
      <div className="popup-footer">
        <button 
          className={`popup-btn popup-btn-${popupType}`}
          onClick={() => setShowPopup(false)}
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
)}

      {/* 🔹 MOSTRAR CONTROLES SOLO CUANDO NO ESTÉ EN MODO FORMULARIO */}
      {!mostrarFormulario && (
        <div className="expedientes-table-actions">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="expedientes-btn-agregar"
          >
            ➕ Crear Expediente
          </button>

          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="expedientes-search-box"
            data-tooltip="Filtra por ID, nombre, correo, teléfono o correlativo"
          />

          <div className="expedientes-sort-container">
            <label htmlFor="expedientesSortSelect" className="expedientes-sort-label">
              Ordenar por:
            </label>
            
           
            <select
              id="expedientesSortSelect"
              value={sortField + "-" + sortDirection}
              onChange={(e) => {
                console.log('Cambiando ordenamiento:', e.target.value);
                handleSortChange(e.target.value);
              }}
              className="expedientes-sort-combobox"
              data-tooltip="Selecciona una ordenación"
            >
              <option value="fecha_registro-desc">Fecha - Más reciente</option>
              <option value="fecha_registro-asc">Fecha - Más antiguo</option>
              <option value="id-asc">ID - Más antiguo</option>
              <option value="id-desc">ID - Más reciente</option>
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
            </select>
          </div>
        </div>
      )}

      {/* 🔹 Tabla de expedientes - SOLO SE MUESTRA CUANDO NO ESTÉ EN MODO FORMULARIO */}
      {!mostrarFormulario && (
        <>
          <div className="table-scroll-container">
            <table className="table table-expedientes">
              <thead>
                <tr>
                  {columns.map((col, i) => (
                    <th key={i} className={i === 0 ? "columna-numero" : ""}>
                      {i === 0 ? (
                        <div className="header-numero">
                          <span className="simbolo-numero">#</span>
                          <span className="indicador-orden">
                            {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                          </span>
                        </div>
                      ) : (
                        col
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expedientesPaginados.length > 0 ? (
                  expedientesPaginados.map((exp, index) => (
                    <tr key={exp.pk_id_expediente}>
                      <td className="celda-numero">{startIndex + index + 1}</td>
                      <td>{exp.correlativo}</td>
                      <td>{exp.nombre}</td>
                      <td>{exp.telefono}</td>
                      <td>{exp.direccion}</td>
                      <td>{exp.email}</td>
                      <td>{formatearFecha(exp.fecha_registro)}</td>
                      <td>
                        <div className="imagenes-preview">
                          {(() => {
                            // Usar el campo foto del expediente para mostrar las imágenes
                            const fotosExpediente = exp.foto;
                            console.log(`Expediente ${exp.pk_id_expediente} tiene fotos:`, fotosExpediente);
                            
                            return fotosExpediente && fotosExpediente.length > 0 ? (
                              fotosExpediente.map((foto, index) => (
                                <div key={index} className="foto-tabla-container">
                                  <img 
                                    src={foto} 
                                    alt={`Foto ${index + 1}`}
                                    title={`Foto ${index + 1} - ${exp.nombre} - Click para zoom`}
                                    className="imagen-miniatura"
                                    onClick={() => openZoomModal({
                                      url: foto,
                                      preview: foto,
                                      nombre: `Foto ${index + 1}`,
                                      id: `${exp.pk_id_expediente}_${index}`
                                    }, exp.pk_id_expediente)}
                                    style={{ cursor: 'pointer' }}
                                    onError={(e) => {
                                      console.error('Error cargando miniatura:', e);
                                      e.target.style.display = 'none';
                                      const errorSpan = document.createElement('span');
                                      errorSpan.textContent = '❌';
                                      errorSpan.title = 'Imagen no disponible';
                                      errorSpan.style.cssText = 'color: #999; font-size: 12px; margin: 2px;';
                                      e.target.parentNode.appendChild(errorSpan);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn-eliminar-foto-tabla"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      eliminarFotoTabla(exp.pk_id_expediente, index);
                                    }}
                                    title="Eliminar foto"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span className="sin-imagenes">Sin fotos</span>
                            );
                          })()}
                        </div>
                      </td>
                      <td>
                        <select
                          onChange={(e) => {
                            if (e.target.value === "editar") handleEditar(exp);
                            if (e.target.value === "eliminar")
                              handleEliminar(exp.pk_id_expediente);
                            if (e.target.value === "visualizar")
                              setExpedienteVisualizar(exp);
                            e.target.selectedIndex = 0;
                          }}
                        >
                          <option value="">Acciones</option>
                          <option value="editar">Editar</option>
                          <option value="eliminar">Eliminar</option>
                          <option value="visualizar">Visualizar</option>
                        </select>
                      </td>
                      <td>Activo</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="celda-numero">-</td>
                    <td colSpan={columns.length - 1} style={{ textAlign: "center" }}>
                      No se encontraron expedientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔹 PAGINACIÓN - SOLO SE MUESTRA CUANDO NO ESTÉ EN MODO FORMULARIO */}
          <div className="pagination-fixed">
            <div className="pagination-container">
              {/* Selector de items por página */}
              <div className="page-size-selector">
                <span>Mostrar</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="page-size-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>Registros por Página </span>
              </div>

              {/* Información de página actual */}
              <div className="page-info">
                <span>
                  Mostrando {expedientesPaginados.length > 0 ? startIndex + 1 : 0} – {endIndex} de {expedientesFiltrados.length}
                </span>
              </div>

              {/* Controles de paginación */}
              <div className="pagination-controls">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPageClamped === 1}
                  className="pagination-btn"
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPageClamped === 1}
                  className="pagination-btn"
                >
                  {"<"}
                </button>
                <div className="page-input-container">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={handlePageInput}
                    onBlur={commitPageInput}
                    onKeyDown={(e) => e.key === "Enter" && commitPageInput()}
                    className="page-input"
                  />
                  <span> / {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPageClamped === totalPages}
                  className="pagination-btn"
                >
                  {">"}
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPageClamped === totalPages}
                  className="pagination-btn"
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 🔹 Formulario - REEMPLAZA TODA LA VISTA CUANDO ESTÁ ACTIVO */}
      {mostrarFormulario && (
        <form className="formulario-expediente" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>{editando ? "Editar Expediente" : "Crear Nuevo Expediente"}</h3>
          </div>

          <div className="fila-formulario">
            <div className="campo-formulario fecha-ancha">
              <label>Fecha *</label>
              <input
                type="date"
                name="fecha_registro"
                value={formData.fecha_registro}
                onChange={handleInputChange}
                required
                disabled={!!editando}
              />
            </div>
            <div className="campo-formulario campo-correlativo">
              {/* Sugerencias de correlativo */}
              {!editando && sugerenciasCorrelativo.length > 0 && (
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
                        onClick={() => {
                          console.log('Clic en sugerencia:', correlativo);
                          setFormData(prev => {
                            console.log('Estado anterior:', prev);
                            const nuevoEstado = { ...prev, correlativo: correlativo };
                            console.log('Nuevo estado:', nuevoEstado);
                            return nuevoEstado;
                          });
                          // Scroll al campo No. Correlativo
                          const correlativoInput = document.querySelector('input[name="correlativo"]');
                          if (correlativoInput) {
                            console.log('Campo encontrado, haciendo scroll...');
                            correlativoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            correlativoInput.focus();
                          } else {
                            console.log('Campo correlativo no encontrado');
                          }
                        }}
                        title={`Usar correlativo sugerido: ${correlativo}`}
                      >
                        #{correlativo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {!editando && loadingSugerencias && (
                <div className="sugerencias-loading">
                  <span className="loading-spinner"></span>
                  <span>Cargando sugerencias...</span>
                </div>
              )}
              
              <label>No. Correlativo *</label>
              <input
                type="text"
                name="correlativo"
                value={formData.correlativo}
                onChange={handleInputChange}
                placeholder="Ej: 003"
                required
                autoComplete="off"
                inputMode="numeric"
                pattern="[0-9]*"
                title="Ingrese solo números"
                disabled={!!editando}
              />
            </div>
          </div>

          <div className="fila-formulario">
            <div className="campo-formulario">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="campo-formulario">
              <label>Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: +(502) 9900-9999"
                pattern="^\+?[0-9\s\-\(\)]+$"
                title="Formato: +(502) 9900-9999"
                required
              />
            </div>
          </div>

          <div className="campo-formulario">
             <label>Correo</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
               placeholder="Ej: usuario@email.com"
            />
          </div>

          <div className="campo-formulario">
             <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
               placeholder="Ej: Calle Principal #123"
            />
          </div>

          <div className="campo-formulario">
            <label>Fotos *</label>
            
            {/* Botón para subir fotos */}
            <div className="upload-photos-container">
              <input 
                type="file" 
                id="photo-upload" 
                accept="image/*" 
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button 
                type="button"
                className="btn-subir-foto"
                onClick={() => document.getElementById('photo-upload').click()}
                disabled={formData.foto.length >= 2}
              >
                📷 Subir Foto ({formData.foto.length}/2)
              </button>
            </div>

            {/* Contador de fotos */}
            {formData.foto.length > 0 && (
              <div className="contador-fotos">
                <span className="contador-texto">
                  {formData.foto.length} foto{formData.foto.length !== 1 ? 's' : ''} de 2
                </span>
              </div>
            )}

            {/* Vista previa de fotos en horizontal */}
            {formData.foto.length > 0 && (
              <div className="vista-previa-fotos-horizontal">
              {formData.foto.map((img, i) => (
                  <div key={i} className="foto-miniatura-container">
                <img
                  src={img}
                  alt={`Foto ${i + 1}`}
                      className="foto-miniatura"
                  onClick={() => setFotoAmpliada(img)}
                />
                    <button
                      type="button"
                      className="btn-eliminar-foto"
                      onClick={() => eliminarFoto(i)}
                      title="Eliminar foto"
                    >
                      ✕
                    </button>
                  </div>
              ))}
            </div>
            )}
          </div>

          <div className="botones-formulario">
            <button type="button" onClick={handleCancelar} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-success">
              {editando ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {/* Modal de confirmación para subir otra foto */}
      <ConfirmModal
        isOpen={showConfirmSubirOtra}
        title="Subir otra foto"
        message="¿Desea subir otra foto?"
        onConfirm={() => {
          // Mantener la intención de subir otra foto; solo cerramos el modal
          setShowConfirmSubirOtra(false);
        }}
        onCancel={() => {
          // Cancelar intención y cerrar el modal
          setShowConfirmSubirOtra(false);
          setFotoMensaje(false);
        }}
      />

      {/* Modal de confirmación para eliminar foto */}
      <ConfirmModal
        isOpen={showConfirmEliminarFoto}
        title="Eliminar foto"
        message="¿Está de acuerdo con borrar la foto?"
        onConfirm={confirmarEliminarFoto}
        onCancel={() => {
          setShowConfirmEliminarFoto(false);
          setFotoIndexToDelete(null);
        }}
      />

      {/* Modal de confirmación para eliminar foto desde tabla - POPUP PERSONALIZADO */}
      {showConfirmEliminarFotoPopup && fotoToDeleteInfo && (
        <div className="popup-overlay">
          <div className="popup-container popup-eliminar-foto">
            <div className="popup-header popup-warning">
              <div className="popup-icon">
                ⚠️
              </div>
              <h3 className="popup-title">Confirmar Eliminación</h3>
              <button 
                className="popup-close"
                onClick={() => {
                  setShowConfirmEliminarFotoPopup(false);
                  setFotoToDeleteInfo(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-message-container">
                <p className="popup-message">
                  ¿Está seguro de que desea eliminar la <strong>Foto {fotoToDeleteInfo.fotoNumero}</strong> del expediente de <strong>{fotoToDeleteInfo.expedienteNombre}</strong>?
                </p>
                <div className="popup-warning-text">
                  <span className="warning-icon">⚠️</span>
                  <span>Esta acción no se puede deshacer</span>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button 
                className="popup-btn popup-btn-cancel"
                onClick={() => {
                  setShowConfirmEliminarFotoPopup(false);
                  setFotoToDeleteInfo(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="popup-btn popup-btn-danger"
                onClick={confirmarEliminarFotoTabla}
              >
                Eliminar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar expediente */}
      <ConfirmModal
        isOpen={showConfirmEliminarExpediente}
        title="Eliminar expediente"
        message="¿Está de acuerdo con eliminar este expediente?"
        onConfirm={confirmarEliminarExpediente}
        onCancel={() => {
          setShowConfirmEliminarExpediente(false);
          setExpedienteToDelete(null);
        }}
      />

      {/* 🔹 Modal para visualizar expediente MEJORADO */}
      {expedienteVisualizar && (
        <div className="modal-overlay modal-expediente-overlay">
          <div className="modal-content modal-expediente-profesional">
            {/* Header con gradiente y icono */}
            <div className="modal-header-profesional">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <span className="icon-expediente">📋</span>
                </div>
                <div className="modal-title-section">
                  <h3>Expediente Médico</h3>
                  <p>Información detallada del paciente</p>
                </div>
              </div>
              <button 
                onClick={() => setExpedienteVisualizar(null)} 
                className="btn-close-profesional"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            
            {/* Body con diseño mejorado - Orden igual al formulario */}
            <div className="modal-body-profesional">
              {/* Primera fila: Fecha y Correlativo */}
              <div className="info-section principal">
                <div className="section-header">
                  <h4>📅 Información Principal</h4>
                </div>
                <div className="expediente-info-grid-profesional">
                  <div className="info-card">
                    <div className="info-icon">📅</div>
                    <div className="info-content">
                      <label>Fecha de Registro</label>
                      <span className="info-value fecha">{formatearFecha(expedienteVisualizar.fecha_registro)}</span>
                </div>
                </div>
                  
                  <div className="info-card">
                    <div className="info-icon">🔢</div>
                    <div className="info-content">
                      <label>No. Correlativo</label>
                      <span className="info-value correlativo">{expedienteVisualizar.correlativo}</span>
                </div>
                </div>
                </div>
              </div>

              {/* Segunda fila: Nombre y Teléfono */}
              <div className="info-section secundaria">
                <div className="section-header">
                  <h4>👤 Datos del Paciente</h4>
                </div>
                <div className="expediente-info-grid-profesional">
                  <div className="info-card">
                    <div className="info-icon">👤</div>
                    <div className="info-content">
                      <label>Nombre del Paciente</label>
                      <span className="info-value nombre">{expedienteVisualizar.nombre}</span>
                </div>
              </div>

                  <div className="info-card">
                    <div className="info-icon">📞</div>
                    <div className="info-content">
                      <label>Teléfono</label>
                      <span className="info-value telefono">{expedienteVisualizar.telefono}</span>
                  </div>
                </div>
                </div>
            </div>

              {/* Tercera fila: Correo (ancho completo) */}
              <div className="info-section terciaria">
                <div className="section-header">
                  <h4>📧 Información de Contacto</h4>
                </div>
                <div className="expediente-info-grid-profesional">
                  <div className="info-card full-width">
                    <div className="info-icon">📧</div>
                    <div className="info-content">
                      <label>Correo Electrónico</label>
                      <span className="info-value email">{expedienteVisualizar.email || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuarta fila: Dirección (ancho completo) */}
              <div className="info-section cuaternaria">
                <div className="section-header">
                  <h4>📍 Ubicación</h4>
                </div>
                <div className="expediente-info-grid-profesional">
                  <div className="info-card full-width">
                    <div className="info-icon">📍</div>
                    <div className="info-content">
                      <label>Dirección</label>
                      <span className="info-value direccion">{expedienteVisualizar.direccion || 'No especificada'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quinta fila: Fotos y Estado */}
              <div className="info-section quinta">
                <div className="section-header">
                  <h4>📸 Información Adicional</h4>
                </div>
                <div className="expediente-info-grid-profesional">
                  <div className="info-card">
                    <div className="info-icon">📸</div>
                    <div className="info-content">
                      <label>Total de Fotos</label>
                      <span className="info-value fotos">{expedienteVisualizar.imagenes ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-icon">✅</div>
                    <div className="info-content">
                      <label>Estado</label>
                      <span className="estado-badge-profesional activo">Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer mejorado */}
            <div className="modal-footer-profesional">
              <div className="footer-info">
                <span className="footer-text">Visual Optics - Sistema de Expedientes</span>
              </div>
              <div className="footer-actions">
              <button 
                onClick={() => setExpedienteVisualizar(null)} 
                  className="btn-cerrar-profesional"
              >
                  <span className="btn-icon">✓</span>
                Cerrar
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal foto ampliada */}
      {fotoAmpliada && (
        <div className="modal-overlay modal-foto">
          {expedienteVisualizar && expedienteVisualizar.foto && expedienteVisualizar.foto.length > 1 && (
            <button className="nav-btn left" onClick={handlePrevFoto}>◀</button>
          )}
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            onClick={() => setFotoAmpliada(null)}
          />
          {expedienteVisualizar && expedienteVisualizar.foto && expedienteVisualizar.foto.length > 1 && (
            <button className="nav-btn right" onClick={handleNextFoto}>▶</button>
          )}
          <button 
            className="btn-close-foto"
            onClick={() => setFotoAmpliada(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* 🔹 Modal para visualizar imágenes */}
      {isModalOpen && modalImage && (
        <div className="modal-overlay">
          <div className="modal-content modal-imagen">
            <div className="modal-header">
              <h3>Imagen del Expediente</h3>
              <button 
                className="modal-close"
                onClick={closeImageModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <img
                src={modalImage.url || modalImage.preview}
                alt={modalImage.nombre || "Imagen"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: "8px"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = '<p>❌ Error al cargar la imagen</p>';
                  errorDiv.style.cssText = 'text-align: center; color: #999; padding: 20px;';
                  e.target.parentNode.appendChild(errorDiv);
                }}
              />
            </div>
            <div className="modal-footer">
              <button 
                onClick={closeImageModal} 
                className="btn-cancel"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal de Zoom para Imágenes */}
      {showZoomModal && zoomImage && (
        <div className="modal-overlay zoom-modal-overlay">
          <div className="zoom-modal-container">
            {/* Header del modal de zoom */}
            <div className="zoom-modal-header">
              <div className="zoom-modal-title">
                <span className="zoom-icon">🔍</span>
                <h3>{zoomImage.nombre}</h3>
              </div>
              <div className="zoom-controls">
                <button 
                  className="zoom-btn zoom-out" 
                  onClick={handleZoomOut}
                  title="Alejar"
                >
                  ➖
                </button>
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  className="zoom-btn zoom-in" 
                  onClick={handleZoomIn}
                  title="Acercar"
                >
                  ➕
                </button>
                <button 
                  className="zoom-btn zoom-reset" 
                  onClick={handleResetZoom}
                  title="Restablecer zoom"
                >
                  🔄
                </button>
              </div>
              <button 
                className="zoom-close-btn"
                onClick={closeZoomModal}
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Contenido del modal de zoom */}
            <div className="zoom-modal-content">
              <div 
                className="zoom-image-container"
                onMouseMove={handleImageDrag}
                onMouseDown={handleImageDrag}
                onWheel={handleWheelZoom}
              >
                <img
                  src={zoomImage.url || zoomImage.preview}
                  alt={zoomImage.nombre || "Imagen"}
                  className="zoom-image"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${zoomPosition.x}%, ${zoomPosition.y}%)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease-out',
                    cursor: zoomLevel > 1 ? 'grab' : 'default'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = '<p>❌ Error al cargar la imagen</p>';
                    errorDiv.style.cssText = 'text-align: center; color: #999; padding: 20px;';
                    e.target.parentNode.appendChild(errorDiv);
                  }}
                />
              </div>
            </div>

            {/* Footer del modal de zoom */}
            <div className="zoom-modal-footer">
              <div className="zoom-instructions">
                <span className="instruction-icon">💡</span>
                <span>Usa los controles, rueda del mouse para zoom o arrastra cuando esté ampliada</span>
              </div>
              <button 
                onClick={closeZoomModal} 
                className="zoom-close-footer-btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}