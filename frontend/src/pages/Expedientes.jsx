/// ===============   WENDYs    ================
import React, { useState, useEffect } from "react";
import "../styles/vista-expedientes.css";

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [formData, setFormData] = useState({
    noCorrelativo: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    fecha: "",
    correo: "",
    direccion: "",
  });

  // Cargar expedientes desde localStorage
  useEffect(() => {
    const expedientesGuardados = localStorage.getItem("expedientes");
    if (expedientesGuardados) {
      setExpedientes(JSON.parse(expedientesGuardados));
    }
  }, []);

  // Guardar expedientes en localStorage
  useEffect(() => {
    localStorage.setItem("expedientes", JSON.stringify(expedientes));
  }, [expedientes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editando) {
      const expedientesActualizados = expedientes.map((exp) =>
        exp.noCorrelativo === editando ? formData : exp
      );
      setExpedientes(expedientesActualizados);
      setEditando(null);
      alert("Expediente actualizado correctamente");
    } else {
      const existe = expedientes.some(
        (exp) => exp.noCorrelativo === formData.noCorrelativo
      );
      if (existe) {
        alert("El número de registro ya existe.");
        return;
      }
      setExpedientes([...expedientes, formData]);
      alert("Expediente guardado correctamente");
    }

    setFormData({
      noCorrelativo: "",
      nombre: "",
      apellidos: "",
      telefono: "",
      fecha: "",
      correo: "",
      direccion: "",
    });
    setMostrarFormulario(false);
  };

  const handleEditar = (expediente) => {
    setFormData(expediente);
    setEditando(expediente.noCorrelativo);
    setMostrarFormulario(true);
  };

  const handleEliminar = (noCorrelativo) => {
    if (window.confirm("¿Eliminar este expediente?")) {
      const filtrados = expedientes.filter(
        (exp) => exp.noCorrelativo !== noCorrelativo
      );
      setExpedientes(filtrados);
    }
  };

  const handleCancelar = () => {
    setFormData({
      noCorrelativo: "",
      nombre: "",
      apellidos: "",
      telefono: "",
      fecha: "",
      correo: "",
      direccion: "",
    });
    setEditando(null);
    setMostrarFormulario(false);
  };

  // Filtrar y ordenar (ascendente)
  const expedientesFiltrados = expedientes
    .filter(
      (exp) =>
        exp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        exp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
        exp.noCorrelativo.includes(filtro)
    )
    .sort((a, b) => parseInt(a.noCorrelativo) - parseInt(b.noCorrelativo));

  // Paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const expedientesPaginados = expedientesFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );
  const totalPaginas = Math.ceil(expedientesFiltrados.length / registrosPorPagina);

  return (
    <div className="expedientes-container">
      <h1 className="titulo-principal">Expedientes de Pacientes</h1>

      <div className="acciones-barra">
        <button onClick={() => setMostrarFormulario(true)} className="btn-primary">
          Nuevo Expediente
        </button>
        <input
          type="text"
          placeholder="Buscar..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-buscar"
        />
      </div>

      {mostrarFormulario && (
        <div className="formulario-expediente">
          <form onSubmit={handleSubmit} className="formulario-paciente">
            <div className="fila-formulario">
              <div className="campo-formulario fecha-ancha">
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="campo-formulario campo-correlativo">
                <label>No. Correlativo *</label>
                <input
                  type="text"
                  name="noCorrelativo"
                  value={formData.noCorrelativo}
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
              <label>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="campo-formulario">
              <label>Correo *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
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
              <button type="button" onClick={handleCancelar} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-success">
                {editando ? "Actualizar" : "Guardar"}
              </button>
              <button type="button" onClick={handleCancelar} className="btn-salir">
                Salir
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla fija */}
      <div className="tabla-fija">
        {(expedientes.length > 0 || filtro) && (
          <>
            <table className="tabla-expedientes">
              <thead>
                <tr>
                  <th>No. Correlativo</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Teléfono</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                  <th>Notificaciones</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {expedientesPaginados.length > 0 ? (
                  expedientesPaginados.map((exp) => (
                    <tr key={exp.noCorrelativo}>
                      <td>{exp.noCorrelativo}</td>
                      <td>{exp.nombre}</td>
                      <td>{exp.apellidos}</td>
                      <td>{exp.telefono}</td>
                      <td>{exp.fecha}</td>
                      <td>
                        <select
                          className="dropdown-acciones"
                          onChange={(e) => {
                            if (e.target.value === "editar") handleEditar(exp);
                            if (e.target.value === "eliminar") handleEliminar(exp.noCorrelativo);
                          }}
                        >
                          <option value="">Seleccionar</option>
                          <option value="editar">Editar</option>
                          <option value="eliminar">Eliminar</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="dropdown-acciones"
                          onChange={(e) => {
                            if (e.target.value === "editar") handleEditar(exp);
                            if (e.target.value === "eliminar") handleEliminar(exp.noCorrelativo);
                            if (e.target.value === "visualizar") alert("Visualizar expediente");
                          }}
                        >
                          <option value="">Seleccionar</option>
                          <option value="editar">Editar</option>
                          <option value="eliminar">Eliminar</option>
                          <option value="visualizar">Visualizar</option>
                        </select>
                      </td>
                      <td>
                        <select className="dropdown-acciones">
                          <option value="activo">Activo</option>
                          <option value="pendiente">Pendiente</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No se encontraron expedientes</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="paginacion">
              <label>
                Mostrar
                <select
                  value={registrosPorPagina}
                  onChange={(e) => {
                    setRegistrosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                registros por página
              </label>
            </div>

            <div className="navegacion-paginas">
              <span>
                Mostrando {indicePrimero + 1} a{" "}
                {Math.min(indiceUltimo, expedientesFiltrados.length)} de{" "}
                {expedientesFiltrados.length} registros
              </span>

              <div className="botones-paginacion">
                <button
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  {"<"}
                </button>

                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                    className={paginaActual === i + 1 ? "activo" : ""}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  {">"}
                </button>
                <button
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                >
                  {">>"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}