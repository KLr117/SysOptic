// ===============   WENDYs    ===============
import React, { useState, useEffect } from "react";
import "../styles/vista-expedientes.css";
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
    "Direccion",
    "Email",
    "Fecha Registro",
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
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    correlativo: "",
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
    fecha_registro: new Date().toISOString().split("T")[0],
  });
  const [editando, setEditando] = useState(null);
  const [expedienteVisualizar, setExpedienteVisualizar] = useState(null);

  const filasOpciones = [5, 10, 20, 50];

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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
  const expedientesFiltrados = [...expedientes]
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
      if (sortField === "mas_antiguo")
        return new Date(a.fecha_registro) - new Date(b.fecha_registro);
      if (sortField === "mas_reciente")
        return new Date(b.fecha_registro) - new Date(a.fecha_registro);
      return 0;
    });

  // 🔹 Paginación
  const totalPaginasRaw = Math.ceil(
    expedientesFiltrados.length / registrosPorPagina
  );
  const totalPaginas = totalPaginasRaw === 0 ? 1 : totalPaginasRaw;
  const pagina = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceUltimo = pagina * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const expedientesPaginados = expedientesFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );
  const mostrarInicio =
    expedientesFiltrados.length === 0 ? 0 : indicePrimero + 1;
  const mostrarFin = Math.min(indiceUltimo, expedientesFiltrados.length);

  // Controles paginación
  const irAPrimera = () => setPaginaActual(1);
  const irAPrev = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const irASiguiente = () =>
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const irAUltima = () => setPaginaActual(totalPaginas);

  // 🔹 Loading / Error
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

      {/* 🔹 Controles de búsqueda y orden */}
      {!mostrarFormulario && (
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPaginaActual(1);
            }}
            className="input-buscador"
          />
          <div className="flex gap-2 items-center">
            <label>
              Ordenar por:{" "}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="nombre">Nombre</option>
                <option value="fecha_registro">Fecha</option>
                <option value="id">ID</option>
                <option value="mas_antiguo">Mas Antiguo</option>
                <option value="mas_reciente">Mas Reciente</option>
              </select>
            </label>
            <button
              onClick={() =>
                setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"))
              }
            >
              {sortDirection === "asc" ? "A ↑" : "A ↓"}
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Tabla de expedientes */}
      {!mostrarFormulario && (
        <div className="table-container">
          <table className="tabla-expedientes">
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
                      <select
                        onChange={(e) => {
                          if (e.target.value === "editar") handleEditar(exp);
                          if (e.target.value === "eliminar")
                            handleEliminar(exp.pk_id_expediente);
                          if (e.target.value === "visualizar")
                            setExpedienteVisualizar(exp);
                          e.target.selectedIndex = 0; // 🔹 Resetear
                        }}
                      >
                        <option value="">Acciones</option>
                        <option value="editar">Editar</option>
                        <option value="eliminar">Eliminar</option>
                        <option value="visualizar">Visualizar</option>
                      </select>
                    </td>
                    <td>
                      <select
                        onChange={(e) =>
                          handleNotificacionChange(
                            exp.pk_id_expediente,
                            e.target.value
                          )
                        }
                      >
                        <option value="crear">Crear</option>
                        <option value="editar">Editar</option>
                        <option value="eliminar">Eliminar</option>
                      </select>
                    </td>
                    <td>
                      <select
                        onChange={(e) =>
                          handleEstadoChange(
                            exp.pk_id_expediente,
                            e.target.value
                          )
                        }
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="proceso">En proceso</option>
                        <option value="realizada">Realizada</option>
                      </select>
                    </td>
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
      )}

      {/* 🔹 Formulario */}
      {mostrarFormulario && (
        <form className="formulario-expediente" onSubmit={handleSubmit}>
          <div className="fila-formulario">
            <div className="campo-formulario fecha-ancha">
              <label>Fecha *</label>
              <input
                type="date"
                name="fecha_registro"
                value={formData.fecha_registro}
                onChange={handleInputChange}
                required
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
                className="input-correlativo"
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

          <div className="botones-formulario">
            <button
              type="button"
              onClick={handleCancelar}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-success">
              {editando ? "Actualizar" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              className="btn-salir"
            >
              Salir
            </button>
          </div>
        </form>
      )}

      {/* 🔹 Modal visualizar */}
      {expedienteVisualizar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Detalles del Expediente</h2>
            <p>
              <b>No. Correlativo:</b> {expedienteVisualizar.correlativo}
            </p>
            <p>
              <b>Nombre:</b> {expedienteVisualizar.nombre}
            </p>
            <p>
              <b>Teléfono:</b> {expedienteVisualizar.telefono}
            </p>
            <p>
              <b>Fecha:</b> {expedienteVisualizar.fecha_registro}
            </p>
            <p>
              <b>Correo:</b> {expedienteVisualizar.email}
            </p>
            <p>
              <b>Dirección:</b> {expedienteVisualizar.direccion}
            </p>
            <button
              className="btn-salir"
              onClick={() => setExpedienteVisualizar(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Paginación */}
      {!mostrarFormulario && (
        <div className="paginacion flex items-center gap-2 mt-4">
          <span>
            Mostrar{" "}
            <select
              value={registrosPorPagina}
              onChange={(e) => {
                setRegistrosPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
            >
              {filasOpciones.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>{" "}
            registros por página
          </span>
          <span>
            Mostrando {mostrarInicio} a {mostrarFin} de{" "}
            {expedientesFiltrados.length}
          </span>
          <div className="flex gap-1 ml-auto">
            <Button onClick={irAPrimera} disabled={pagina === 1}>
              &lt;&lt;
            </Button>
            <Button onClick={irAPrev} disabled={pagina === 1}>
              &lt;
            </Button>
            <span>{pagina}</span>
            <Button onClick={irASiguiente} disabled={pagina === totalPaginas}>
              &gt;
            </Button>
            <Button onClick={irAUltima} disabled={pagina === totalPaginas}>
              &gt;&gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
