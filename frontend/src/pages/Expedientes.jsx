// ===============   WENDYs    ===============
//en la base de datos iniciar en la linea 297 en el ldd modificacion con alter table 
import React, { useState, useEffect } from "react";
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // "success", "error", "warning", "info"

  // 🔹 Mostrar popup
  const mostrarPopup = (mensaje, tipo = "success") => {
    setPopupMessage(mensaje);
    setPopupType(tipo);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  // 🔹 Cargar expedientes
  useEffect(() => {
    const cargarExpedientes = async () => {
      try {
        setLoading(true);
        const data = await getExpedientes();
        setExpedientes(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar expedientes");
        mostrarPopup("Error al cargar expedientes", "error");
      } finally {
        setLoading(false);
      }
    };
    cargarExpedientes();
  }, []);

  // 🔹 Manejo de formulario
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto" && files && files[0]) {
      if (formData.foto.length >= 2) {
        mostrarPopup("Solo se permiten máximo 2 fotos", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          foto: [...prev.foto, reader.result],
        }));
        setFotoMensaje(true);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    if (fotoMensaje && formData.foto.length < 2) {
      const confirmacion = window.confirm("¿Desea subir otra foto?");
      if (!confirmacion) setFotoMensaje(false);
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

  // 🔹 Filtrado y ordenamiento
  const filtro = search.trim().toLowerCase();
  const expedientesFiltrados = [...expedientes]
    .filter(
      (exp) =>
        !filtro ||
        (exp.nombre || "").toLowerCase().includes(filtro) ||
        (exp.telefono || "").toLowerCase().includes(filtro) ||
        (exp.email || "").toLowerCase().includes(filtro) ||
        (exp.correlativo || "").toLowerCase().includes(filtro)
    )
    .sort((a, b) => {
      if (sortField === "id") {
        return sortDirection === "asc"
          ? (a.pk_id_expediente || 0) - (b.pk_id_expediente || 0)
          : (b.pk_id_expediente || 0) - (a.pk_id_expediente || 0);
      }
      if (sortField === "nombre") {
        return sortDirection === "asc"
          ? (a.nombre || "").localeCompare(b.nombre || "")
          : (b.nombre || "").localeCompare(a.nombre || "");
      }
      if (sortField === "fecha_registro") {
        return sortDirection === "asc"
          ? new Date(a.fecha_registro) - new Date(b.fecha_registro)
          : new Date(b.fecha_registro) - new Date(a.fecha_registro);
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
        <div className="flex justify-between items-center mb-3">
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-busqueda"
          />

          <div className="flex items-center gap-2">
            {/* Ordenamiento */}
            <select
              value={sortField + "-" + sortDirection}
              onChange={(e) => {
                const [field, direction] = e.target.value.split("-");
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <option value="id-asc">ID - Más antiguo</option>
              <option value="id-desc">ID - Más reciente</option>
              <option value="fecha_registro-asc">Fecha - Más antiguo</option>
              <option value="fecha_registro-desc">Fecha - Más reciente</option>
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
            </select>

            {/* Botón Crear expediente */}
            <button
              onClick={() => setMostrarFormulario(true)}
              className="btn-success"
            >
              Crear expediente
            </button>
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
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expedientesPaginados.length > 0 ? (
                  expedientesPaginados.map((exp) => (
                    <tr key={exp.pk_id_expediente}>
                      <td>{exp.correlativo}</td>
                      <td>{exp.nombre}</td>
                      <td>{exp.telefono}</td>
                      <td>{exp.direccion}</td>
                      <td>{exp.email}</td>
                      <td>{exp.fecha_registro}</td>
                      <td>
                        {exp.foto && exp.foto.length > 0 ? (
                          <img
                            src={Array.isArray(exp.foto) ? exp.foto[0] : exp.foto}
                            alt="Foto del expediente"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              objectFit: "cover",
                            }}
                            onClick={() => {
                              setExpedienteVisualizar(exp);
                              setFotoIndex(0);
                              setFotoAmpliada(exp.foto[0]);
                            }}
                          />
                        ) : (
                          <span>Sin foto</span>
                        )}
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
                    <td colSpan={columns.length} style={{ textAlign: "center" }}>
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
              <label>No. Correlativo *</label>
              <input
                type="text"
                name="correlativo"
                value={formData.correlativo}
                onChange={handleInputChange}
                required
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
                required
              />
            </div>
          </div>

          <div className="campo-formulario">
            <label>Correo *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="campo-formulario">
            <label>Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              required
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

      {/* 🔹 Modal para visualizar expediente COMPLETO */}
      {expedienteVisualizar && (
        <div className="modal-overlay">
          <div className="modal-content modal-expediente">
            <div className="modal-header">
              <h3>Información del Expediente</h3>
            </div>
            
            <div className="modal-body">
              <div className="expediente-info-grid">
                <div className="info-item">
                  <label>No. Correlativo:</label>
                  <span>{expedienteVisualizar.correlativo}</span>
                </div>
                <div className="info-item">
                  <label>Nombre:</label>
                  <span>{expedienteVisualizar.nombre}</span>
                </div>
                <div className="info-item">
                  <label>Teléfono:</label>
                  <span>{expedienteVisualizar.telefono}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{expedienteVisualizar.email}</span>
                </div>
                <div className="info-item full-width">
                  <label>Dirección:</label>
                  <span>{expedienteVisualizar.direccion}</span>
                </div>
                <div className="info-item">
                  <label>Fecha de Registro:</label>
                  <span>{expedienteVisualizar.fecha_registro}</span>
                </div>
                <div className="info-item">
                  <label>Estado:</label>
                  <span className="estado-activo">Activo</span>
                </div>
              </div>

              {/* Fotos del expediente */}
              {expedienteVisualizar.foto && expedienteVisualizar.foto.length > 0 && (
                <div className="fotos-expediente">
                  <label>Fotos:</label>
                  <div className="galeria-fotos">
                    {expedienteVisualizar.foto.map((foto, index) => (
                      <img
                        key={index}
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="foto-miniatura"
                        onClick={() => {
                          setFotoAmpliada(foto);
                          setFotoIndex(index);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setExpedienteVisualizar(null)} 
                className="btn-cancel"
              >
                Cerrar
              </button>
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
    </div>
  );
}