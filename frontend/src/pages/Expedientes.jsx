// ===============   WENDYs    ===============
import React, { useState, useEffect } from "react";
import "../styles/vista-expedientes.css";

// Componente principal
export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("masRecientes");
  const [expedienteVisualizar, setExpedienteVisualizar] = useState(null);
  const [orden, setOrden] = useState("reciente");/*ordena por defecto el mas reciente */


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

  const ordenarExpedientes = (lista) => {
    switch (ordenarPor) {
      case "fechaRecepcion":
        return [...lista].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      case "fechaEntrega":
        return [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      case "id":
        return [...lista].sort(
          (a, b) => parseInt(a.noCorrelativo) - parseInt(b.noCorrelativo)
        );
      case "masRecientes":
        return [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      case "masAntiguos":
        return [...lista].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      default:
        return lista;
    }
  };

  // Datos filtrados y ordenados (simulado)
  const expedientesFiltrados = ordenarExpedientes(
    expedientes.filter((e) =>
    e.nombre?.toLowerCase().includes(filtro.toLowerCase())
  )
  );

  // Calcular paginación
  const totalPaginasRaw = Math.ceil(expedientesFiltrados.length / registrosPorPagina);
  const totalPaginas = totalPaginasRaw === 0 ? 1 : totalPaginasRaw;
  const pagina = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceUltimo = pagina * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const expedientesPaginados = expedientesFiltrados.slice(indicePrimero, indiceUltimo);

  const mostrarInicio = expedientesFiltrados.length === 0 ? 0 : indicePrimero + 1;
  const mostrarFin = Math.min(indiceUltimo, expedientesFiltrados.length);

  // Funciones de navegación
  const irAPrimera = () => setPaginaActual(1);
  const irAPrev = () => setPaginaActual(prev => Math.max(prev - 1, 1));
  const irASiguiente = () => setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
  const irAUltima = () => setPaginaActual(totalPaginas);


  
  return (
    <div className="expedientes-container">
      <h1 className="titulo-principal">Gestión de Expedientes</h1>

      {/* Mostrar controles solo si NO estamos en el formulario */}
      {!mostrarFormulario && (
        <>
          <div className="barra-superior">
            <div>
              <label>Ordenar por: </label>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="dropdown-ordenar"
              >
                <option value="fechaRecepcion">Fecha de recepción</option>
                <option value="fechaEntrega">Fecha de entrega</option>
                <option value="id">ID</option>
                <option value="masRecientes">Más recientes</option>
                <option value="masAntiguos">Más antiguos</option>
              </select>
            </div>

            <button
              className="btn-primary"
              onClick={() => setMostrarFormulario(true)}
            >
              Nuevo Expediente
            </button>
          </div>

          {/* Buscar */}
          <input
            type="text"
            placeholder="Buscar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-buscar"
          />

          {/* Tabla fija */}
          <div className="tabla-fija">
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
                            if (e.target.value === "eliminar")
                              handleEliminar(exp.noCorrelativo);
                            if (e.target.value === "visualizar")
                              setExpedienteVisualizar(exp);
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
                          <option value="crear">Crear</option>
                          <option value="editar">Editar</option>
                          <option value="eliminar">Eliminar</option>
                        </select>
                      </td>
                      <td>
                        <select className="dropdown-acciones">
                          <option value="pendiente">Pendiente</option>
                          <option value="proceso">Proceso</option>
                          <option value="realizada">Realizada</option>
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
          </div>
        </>
      )}

      {/* Formulario de nuevo/editar expediente */}
      {mostrarFormulario && (
        <form className="formulario-expediente" onSubmit={handleSubmit}>
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
      )}

      {/* Modal Visualizar */}
      {expedienteVisualizar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h2>Detalles del Expediente</h2>
            <p>
              <b>No. Correlativo:</b> {expedienteVisualizar.noCorrelativo}
            </p>
            <p>
              <b>Nombre:</b> {expedienteVisualizar.nombre}
            </p>
            <p>
              <b>Apellidos:</b> {expedienteVisualizar.apellidos}
            </p>
            <p>
              <b>Teléfono:</b> {expedienteVisualizar.telefono}
            </p>
            <p>
              <b>Fecha:</b> {expedienteVisualizar.fecha}
            </p>
            <p>
              <b>Correo:</b> {expedienteVisualizar.correo}
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

      {/* Paginación */}
      <div className="paginacion">
        <div className="controls">
          <label>
            Mostrar{" "}
            <select
              value={registrosPorPagina}
              onChange={e => {
                setRegistrosPorPagina(Number(e.target.value));
                setPaginaActual(1); // Reiniciar a la primera página
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>{" "}
            registros por página
          </label>

          <div>
            Mostrando {mostrarInicio} a {mostrarFin} de {expedientesFiltrados.length} registros
          </div>
        </div>

        <div className="botones-paginacion">
          <button onClick={irAPrimera} disabled={pagina === 1}>
            &lt;&lt;
          </button>
          <button onClick={irAPrev} disabled={pagina === 1}>
            &lt;
          </button>
          <span>{pagina}</span>
          <button onClick={irASiguiente} disabled={pagina === totalPaginas}>
            &gt;
          </button>
          <button onClick={irAUltima} disabled={pagina === totalPaginas}>
            &gt;&gt;
          </button>
        </div>
      </div>

    </div>
  );
}

