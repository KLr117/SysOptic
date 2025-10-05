// ===============   WENDYs    ===============
//en la base de datos iniciar en la linea 297 en el ldd modificacion con alter table 
import React, { useState, useEffect } from "react";
import "../styles/vista-expedientes.css";
import "../styles/pagination-tooltips.css";
import "../styles/tables.css";
import "../styles/theme.css";
import Titulo from "../components/Titulo";
import Button from "../components/Button";
import PopUp from "../components/PopUp";
import ImageModal from "../components/ImageModal";
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

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
    "Notificaciones",
    "Estado",
  ];

  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("fecha_registro");
  const [sortDirection, setSortDirection] = useState("desc");

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [inputError, setInputError] = useState(false);

  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    correlativo: "",
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
    fecha_registro: new Date().toISOString().split("T")[0],
    fotos: [],
  });
  const [editando, setEditando] = useState(null);

  const [fotoModal, setFotoModal] = useState(null); // para el modal
  const [fotoIndex, setFotoIndex] = useState(0); // para carrusel

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
      } finally {
        setLoading(false);
      }
    };
    cargarExpedientes();
  }, []);

  // 🔹 Manejo de formulario
  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // Si sube archivo
      const newFotos = Array.from(files).map((f) => URL.createObjectURL(f));
      if (formData.fotos.length === 0) {
        // Primera foto
        setFormData((prev) => ({
          ...prev,
          fotos: [...prev.fotos, newFotos[0]],
        }));
        // Preguntar por segunda foto
        setTimeout(() => {
          const subirSegunda = window.confirm("¿Desea subir otra foto?");
          if (subirSegunda) {
            // Espera al usuario que suba la segunda foto
            return;
          } else {
            // Cierra formulario automáticamente
            setMostrarFormulario(false);
          }
        }, 100);
      } else if (formData.fotos.length === 1 && newFotos[0]) {
        setFormData((prev) => ({
          ...prev,
          fotos: [...prev.fotos, newFotos[0]],
        }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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
        alert("Expediente actualizado correctamente");
        setEditando(null);
      } else {
        const newExp = await createExpediente(formData);
        setExpedientes([
          ...expedientes,
          { ...formData, pk_id_expediente: newExp.pk_id_expediente },
        ]);
        alert("Expediente guardado correctamente");
      }
      setFormData({
        correlativo: "",
        nombre: "",
        telefono: "",
        direccion: "",
        email: "",
        fecha_registro: new Date().toISOString().split("T")[0],
        fotos: [],
      });
      setMostrarFormulario(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar expediente");
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
      fotos: exp.fotos || [],
    });
    setEditando(exp.pk_id_expediente);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este expediente?")) return;
    try {
      await deleteExpediente(id);
      setExpedientes(expedientes.filter((exp) => exp.pk_id_expediente !== id));
    } catch (err) {
      console.error(err);
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
      fotos: [],
    });
    setEditando(null);
    setMostrarFormulario(false);
  };

  const handleEstadoChange = (id, value) => {
    console.log("Cambiar estado de expediente", id, "a", value);
  };

  const handleNotificacionChange = (id, value) => {
    console.log("Cambiar notificación de expediente", id, "a", value);
  };

  // 🔹 Filtrado y ordenamiento
  const filtro = search.trim().toLowerCase();
  const filtered = [...expedientes]
    .filter(
      (exp) =>
        !filtro ||
        (exp.nombre || "").toLowerCase().includes(filtro) ||
        (exp.telefono || "").toLowerCase().includes(filtro) ||
        (exp.email || "").toLowerCase().includes(filtro)
    )
    .sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortField === "id")
        return dir * ((a.pk_id_expediente || 0) - (b.pk_id_expediente || 0));
      if (sortField === "nombre")
        return dir * (a.nombre || "").localeCompare(b.nombre || "");
      if (sortField === "fecha_registro")
        return dir * (new Date(a.fecha_registro) - new Date(b.fecha_registro));
      return 0;
    });

  // 🔹 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const currentData = filtered.slice(startIndex, endIndex);

  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  const handlePageInput = (e) => setPageInput(e.target.value);

  const commitPageInput = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputError(false);
    } else {
      setPageInput(String(currentPage));
      setInputError(true);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered, pageSize, totalPages, currentPage]);

  // 🔹 Modal foto con carrusel
  const openFotoModal = (fotos, index = 0) => {
    setFotoModal(fotos);
    setFotoIndex(index);
  };
  const closeFotoModal = () => {
    setFotoModal(null);
    setFotoIndex(0);
  };
  const nextFoto = () => setFotoIndex((i) => (i + 1) % fotoModal.length);
  const prevFoto = () => setFotoIndex((i) => (i - 1 + fotoModal.length) % fotoModal.length);

  if (loading) return <div className="text-center p-4">Cargando expedientes...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="expedientes-container p-4">
      <div className="flex justify-between items-center mb-4">
        <Titulo text="Gestión de Expedientes" />
        {!mostrarFormulario && (
          <Button onClick={() => setMostrarFormulario(true)}>
            Nuevo Expediente
          </Button>
        )}
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="form-expediente mb-4">
          <input type="text" name="correlativo" placeholder="Correlativo" value={formData.correlativo} onChange={handleInputChange} required />
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleInputChange} required />
          <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleInputChange} />
          <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleInputChange} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
          <input type="date" name="fecha_registro" value={formData.fecha_registro} onChange={handleInputChange} required />
          <input type="file" accept="image/*" onChange={handleInputChange} />
          {formData.fotos.length > 0 && (
            <div className="preview-fotos">
              {formData.fotos.map((foto, i) => (
                <img key={i} src={foto} alt={`Foto ${i + 1}`} className="foto-mini" />
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Button type="submit">{editando ? "Actualizar" : "Guardar"}</Button>
            <Button type="button" onClick={handleCancelar}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Buscador y orden */}
      {!mostrarFormulario && (
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="input-buscador"
          />
          <div className="flex gap-2 items-center">
            <label>
              Ordenar por:{" "}
              <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                <option value="nombre">Nombre</option>
                <option value="fecha_registro">Fecha</option>
                <option value="id">ID</option>
              </select>
            </label>
            <button onClick={() => setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"))}>
              {sortDirection === "asc" ? "A ↑" : "A ↓"}
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="table-container">
        <table className="table expedientes-table">
          <thead>
            <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? currentData.map((exp) => (
              <tr key={exp.pk_id_expediente}>
                <td>{exp.correlativo}</td>
                <td>{exp.nombre}</td>
                <td>{exp.telefono}</td>
                <td>{exp.direccion}</td>
                <td>{exp.email}</td>
                <td>{exp.fecha_registro}</td>
                <td>
                  {exp.fotos && exp.fotos.length > 0 ? (
                    <div className="imagenes-preview">
                      {exp.fotos.map((foto, i) => (
                        <img
                          key={i}
                          src={foto}
                          alt={`Foto ${i + 1}`}
                          className="imagen-miniatura"
                          onClick={() => openFotoModal(exp.fotos, i)}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="sin-imagenes">Sin fotos</span>
                  )}
                </td>
                <td>
                  <select
                    defaultValue="Acciones"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Editar") handleEditar(exp);
                      if (val === "Eliminar") handleEliminar(exp.pk_id_expediente);
                      e.target.value = "Acciones";
                    }}
                  >
                    <option disabled>Acciones</option>
                    <option value="Editar">Editar</option>
                    <option value="Eliminar">Eliminar</option>
                  </select>
                </td>
                <td>
                  <select
                    defaultValue="Crear"
                    onChange={(e) => handleNotificacionChange(exp.pk_id_expediente, e.target.value)}
                  >
                    <option value="Crear">Crear</option>
                    <option value="Mostrar">Mostrar</option>
                    <option value="Editar">Editar</option>
                  </select>
                </td>
                <td>
                  <select
                    defaultValue="Pendiente"
                    onChange={(e) => handleEstadoChange(exp.pk_id_expediente, e.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Realizada">Realizada</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="text-center">No hay registros</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination-container">
        <div className="page-size-selector">
          <label>Mostrar</label>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>registros por página</span>
        </div>
        <span className="pagination-info">
          Mostrando {startIndex + 1} – {endIndex} de {filtered.length}
        </span>
        <div className="pagination-controls">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><FaAngleDoubleLeft /></button>
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}><FaAngleLeft /></button>
          <input type="number" min="1" max={totalPages} value={pageInput} onChange={handlePageInput} onBlur={commitPageInput} />
          <span>/ {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><FaAngleRight /></button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><FaAngleDoubleRight /></button>
        </div>
      </div>

      {/* PopUp */}
      <PopUp
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* Modal de fotos */}
      {fotoModal && (
        <ImageModal
          isOpen={!!fotoModal}
          onClose={closeFotoModal}
          image={fotoModal[fotoIndex]}
          nextImage={fotoModal.length > 1 ? nextFoto : null}
          prevImage={fotoModal.length > 1 ? prevFoto : null}
        />
      )}
    </div>
  );
}
