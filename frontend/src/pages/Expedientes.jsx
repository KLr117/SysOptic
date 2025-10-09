// ===============   WENDYs    ===============
//en la base de datos iniciar en la linea 297 en el ldd modificacion con alter table 
import React, { useState, useEffect } from "react";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/vista-expedientes.css";
import "../styles/popup.css";
import Titulo from "../components/Titulo";
import Button from "../components/Button";
import {
  getExpedientes,
  createExpediente,
  updateExpediente,
  deleteExpediente,
} from "../services/expedientesService";

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
    fecha_registro: new Date().toISOString().split("T")[0],
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // "success", "error", "warning", "info"
  
   // Estados para sugerencias de correlativo
   const [sugerenciasCorrelativo, setSugerenciasCorrelativo] = useState([]);
   const [loadingSugerencias, setLoadingSugerencias] = useState(false);
   
   // Estados para modal de imágenes
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalImage, setModalImage] = useState(null);

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

  // 🔹 Cargar expedientes
  useEffect(() => {
    const cargarExpedientes = async () => {
      try {
        setLoading(true);
        const data = await getExpedientes();
        // Validar que data sea un array antes de establecerlo
        if (Array.isArray(data)) {
          setExpedientes(data);
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

  // 🔹 Cargar sugerencias de correlativo
  useEffect(() => {
    const cargarSugerenciasCorrelativo = async () => {
      try {
        setLoadingSugerencias(true);
        const data = await getExpedientes();
         if (Array.isArray(data)) {
           // Obtener todos los correlativos numéricos para encontrar el siguiente consecutivo
           const correlativosNumericos = data
             .map(exp => exp.correlativo)
             .filter(correlativo => correlativo)
             .map(correlativo => {
               // Extraer solo números del correlativo
               const numeros = correlativo.replace(/\D/g, '');
               return numeros ? parseInt(numeros) : 0;
             })
             .filter(num => num > 0) // Solo números válidos
             .sort((a, b) => b - a); // Ordenar de mayor a menor
           
           console.log('Correlativos numéricos encontrados:', correlativosNumericos);
           
           if (correlativosNumericos.length > 0) {
             // Encontrar el siguiente número consecutivo
             let siguienteNumero = correlativosNumericos[0] + 1;
             
             // Verificar si el siguiente número ya existe
             while (correlativosNumericos.includes(siguienteNumero)) {
               siguienteNumero++;
             }
             
             console.log('Siguiente correlativo consecutivo:', siguienteNumero);
             setSugerenciasCorrelativo([siguienteNumero.toString()]);
           } else {
             // Si no hay correlativos, empezar con 1
             console.log('No hay correlativos existentes, empezando con 1');
             setSugerenciasCorrelativo(['1']);
           }
         }
       } catch (error) {
         console.error('Error cargando sugerencias de correlativo:', error);
         // En caso de error, sugerir 1
         setSugerenciasCorrelativo(['1']);
       } finally {
        setLoadingSugerencias(false);
      }
    };
    
     cargarSugerenciasCorrelativo();
   }, []);

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
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    console.log('handleInputChange llamado:', { name, value, files: !!files });
    
     // Validación especial para el campo correlativo - solo números
     if (name === "correlativo") {
       // Permitir solo números
       const soloNumeros = value.replace(/[^0-9]/g, '');
       console.log('Campo correlativo:', { original: value, filtrado: soloNumeros });
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
     
     // Validación especial para el campo teléfono - solo números
     if (name === "telefono") {
       // Permitir solo números
       const soloNumeros = value.replace(/[^0-9]/g, '');
       console.log('Campo teléfono:', { original: value, filtrado: soloNumeros });
       setFormData({ ...formData, [name]: soloNumeros });
       return;
     }
    
     if (name === "foto" && files && files[0]) {
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
       resizeImage(file, 1200, 900).then(base64 => {
         setFormData(prev => ({
           ...prev,
           foto: [...prev.foto, base64]
         }));
         setFotoMensaje(true);
       }).catch(error => {
         console.error('Error al redimensionar imagen:', error);
         mostrarPopup("Error al procesar la imagen", "error");
       });
     } else {
      console.log('Actualizando campo:', { name, value });
      setFormData({ ...formData, [name]: value });
    }
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
        await updateExpediente(editando, formData);
        setExpedientes(
          expedientes.map((exp) =>
            exp.pk_id_expediente === editando
              ? { ...formData, pk_id_expediente: editando }
              : exp
          )
        );
        mostrarPopup("Expediente actualizado correctamente", "success");
        setEditando(null);
      } else {
        const newExp = await createExpediente(formData);
        setExpedientes([
          ...expedientes,
          { ...formData, pk_id_expediente: newExp.pk_id_expediente },
        ]);
        mostrarPopup("Expediente guardado correctamente", "success");
      }
      setFormData({
        correlativo: "",
        nombre: "",
        telefono: "",
        direccion: "",
        email: "",
        fecha_registro: new Date().toISOString().split("T")[0],
        foto: [],
      });
      setMostrarFormulario(false);
    } catch (err) {
      console.error(err);
      mostrarPopup("Error al guardar expediente", "error");
    }
  };

  const handleEditar = (exp) => {
    setFormData({
      correlativo: exp.correlativo,
      nombre: exp.nombre,
      telefono: exp.telefono,
      direccion: exp.direccion,
      email: exp.email,
      fecha_registro: exp.fecha_registro,
      foto: exp.foto || [],
    });
    setEditando(exp.pk_id_expediente);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este expediente?")) return;
    try {
      await deleteExpediente(id);
      setExpedientes(expedientes.filter((exp) => exp.pk_id_expediente !== id));
      mostrarPopup("Expediente eliminado correctamente", "success");
    } catch (err) {
      console.error(err);
      mostrarPopup("Error al eliminar expediente", "error");
    }
  };

  const handleCancelar = () => {
    setFormData({
      correlativo: "",
      nombre: "",
      telefono: "",
      direccion: "",
      email: "",
      fecha_registro: new Date().toISOString().split("T")[0],
      foto: [],
    });
    setEditando(null);
    setMostrarFormulario(false);
  };

  // Función para mostrar flecha de ordenamiento
    const renderSortArrow = (field) =>
      sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';
  
    // Estados para PopUp
    const [popup, setPopup] = useState({
      isOpen: false,
      title: '',
      message: '',
      type: 'success'
    });

   // 🔹 Filtrado y ordenamiento
   const filtro = search.trim().toLowerCase();
   
   // Validar que expedientes sea un array antes de usar spread operator
   const expedientesFiltrados = Array.isArray(expedientes) ? [...expedientes] : []
    .filter(
      (exp) =>
        !filtro ||
        (exp.nombre || "").toLowerCase().includes(filtro) ||
        (exp.telefono || "").toLowerCase().includes(filtro) ||
        (exp.email || "").toLowerCase().includes(filtro) ||
        (exp.correlativo || "").toLowerCase().includes(filtro)
    )
    .sort((a, b) => {
      // Ordenamiento por ID (pk_id_expediente)
      if (sortField === "id") {
        const idA = parseInt(a.pk_id_expediente) || 0;
        const idB = parseInt(b.pk_id_expediente) || 0;
        return sortDirection === "asc" ? idA - idB : idB - idA;
      }
      
      // Ordenamiento por Nombre
      if (sortField === "nombre") {
        const nombreA = (a.nombre || "").toLowerCase().trim();
        const nombreB = (b.nombre || "").toLowerCase().trim();
        if (sortDirection === "asc") {
          return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        } else {
          return nombreB.localeCompare(nombreA, 'es', { sensitivity: 'base' });
        }
      }
      
      // Ordenamiento por Fecha
      if (sortField === "fecha_registro") {
        // Manejar fechas vacías o inválidas
        const fechaA = a.fecha_registro ? new Date(a.fecha_registro) : new Date('1900-01-01');
        const fechaB = b.fecha_registro ? new Date(b.fecha_registro) : new Date('1900-01-01');
        
        // Verificar que las fechas sean válidas
        const fechaAValida = !isNaN(fechaA.getTime());
        const fechaBValida = !isNaN(fechaB.getTime());
        
        if (!fechaAValida && !fechaBValida) return 0;
        if (!fechaAValida) return sortDirection === "asc" ? 1 : -1;
        if (!fechaBValida) return sortDirection === "asc" ? -1 : 1;
        
        return sortDirection === "asc" ? fechaA - fechaB : fechaB - fechaA;
      }
      
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
             data-tooltip="Filtra por nombre, correo o teléfono"
           />

           <div className="expedientes-sort-container">
             <label htmlFor="expedientesSortSelect" className="expedientes-sort-label">
               Ordenar por:
             </label>
            
           
            <select
              id="expedientesSortSelect"
              value={sortField + "-" + sortDirection}
               onChange={(e) => {
                 const [field, direction] = e.target.value.split("-");
                 setSortField(field);
                 setSortDirection(direction);
               }}
              className="expedientes-sort-combobox"
              data-tooltip="Selecciona una ordenación"
            >
              <option value="fecha_registro-desc">ID - Más reciente  </option>
              <option value="id-asc">ID - Más antiguo </option>
              <option value="id-desc">Fecha - Más reciente</option>
              <option value="fecha_registro-asc">Fecha - Más antiguo </option>
              <option value="nombre-asc">Nombre A-Z </option>
              <option value="nombre-desc">Nombre Z-A </option>
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
                            const fotosExpediente = exp.foto;
                            console.log(`Fotos para expediente ${exp.pk_id_expediente}:`, fotosExpediente);
                            return fotosExpediente && fotosExpediente.length > 0 ? (
                              fotosExpediente.map((foto, index) => (
                                <img 
                                  key={index}
                                  src={foto} 
                                  alt={`Foto ${index + 1}`}
                                  title={`Foto ${index + 1} - ${exp.nombre}`}
                                  className="imagen-miniatura"
                                  onClick={() => openImageModal({
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
              
              {loadingSugerencias && (
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
                placeholder="Ej: 1234567890"
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
            <input type="file" name="foto" accept="image/*" onChange={handleInputChange} />
            <div className="vista-previa-fotos">
              {formData.foto.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Foto ${i + 1}`}
                  onClick={() => setFotoAmpliada(img)}
                />
              ))}
            </div>
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
                      <span className="info-value fotos">{expedienteVisualizar.foto ? expedienteVisualizar.foto.length : 0}</span>
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
    </div>
  );
}