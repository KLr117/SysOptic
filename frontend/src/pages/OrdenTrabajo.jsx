import React, { useState } from "react";
import "../styles/orden-trabajo.css";
import "../styles/table-responsive.css";
import Titulo from "../components/Titulo";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const OrdenTrabajo = () => {
  const navigate = useNavigate();

  const columns = [
    "No Orden",
    "Paciente",
    "Dirección",
    "Correo",
    "Teléfono",
    "Fecha Recepción",
    "Fecha Entrega",
    "Total",
    "Adelanto",
    "Saldo",
    "Acciones",
    "Notificaciones",
    "Estado",
  ];

  const [ordenesData, setOrdenesData] = useState([
    {
      id: 1,
      paciente: "Juan Pérez",
      direccion: "Calle 123",
      correo: "juan@example.com",
      telefono: "555-1234",
      fechaRecepcion: "2025-09-04",
      fechaEntrega: "2025-09-10",
      total: 150,
      adelanto: 50,
      saldo: 100,
      estado: "Pendiente",
      notificacion: "Crear",
    },
    {
      id: 2,
      paciente: "María López",
      direccion: "Av. Central 456",
      correo: "maria@example.com",
      telefono: "555-5678",
      fechaRecepcion: "2025-09-03",
      fechaEntrega: "2025-09-09",
      total: 200,
      adelanto: 100,
      saldo: 100,
      estado: "En proceso",
      notificacion: "Mostrar",
    },
  ]);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("fechaRecepcion");
  const [sortDirection, setSortDirection] = useState("desc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const filasOpciones = [5, 10, 20, 50];

  const agregarOrden = () => navigate("/agregar-orden-trabajo");
  const editarOrden = (id) => navigate("/editar-orden-trabajo");
  const verOrden = (id) => navigate(`/ver-orden-trabajo/${id}`);
  const eliminarOrden = (id) => {
    if (window.confirm(`¿Eliminar la orden ${id}?`)) {
      setOrdenesData((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleEstadoChange = (id, value) => {
    setOrdenesData((prev) =>
      prev.map((o) => (o.id === id ? { ...o, estado: value } : o))
    );
  };

  const handleNotificacionChange = (id, value) => {
    setOrdenesData((prev) =>
      prev.map((o) => (o.id === id ? { ...o, notificacion: value } : o))
    );
  };

  // Filtrado por search
  const filtro = search.trim().toLowerCase();
  const ordenesFiltradas = ordenesData
    .filter((orden) => {
      if (!filtro) return true;
      return (
        (orden.paciente || "").toLowerCase().includes(filtro) ||
        (orden.telefono || "").toLowerCase().includes(filtro) ||
        (orden.correo || "").toLowerCase().includes(filtro)
      );
    })
    .sort((a, b) => {
      // Ordenar según combobox
      const dir = sortDirection === "asc" ? 1 : -1;

      if (sortField === "id") return dir * ((a.id || 0) - (b.id || 0));
      if (sortField === "paciente") {
        return dir * ((a.paciente || "").localeCompare(b.paciente || ""));
      }
      if (sortField === "fechaRecepcion" || sortField === "fechaEntrega") {
        const da = a[sortField] ? new Date(a[sortField]) : new Date(0);
        const db = b[sortField] ? new Date(b[sortField]) : new Date(0);
        return dir * (da - db);
      }
      if (sortField === "recientes") {
        return -1 * dir * (new Date(a.fechaRecepcion) - new Date(b.fechaRecepcion));
      }
      if (sortField === "viejos") {
        return dir * (new Date(a.fechaRecepcion) - new Date(b.fechaRecepcion));
      }
      return 0;
    });

  // Paginación
  const totalPaginasRaw = Math.ceil(ordenesFiltradas.length / registrosPorPagina);
  const totalPaginas = totalPaginasRaw === 0 ? 1 : totalPaginasRaw;
  const pagina = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceUltimo = pagina * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const ordenesPaginadas = ordenesFiltradas.slice(indicePrimero, indiceUltimo);

  const mostrarInicio = ordenesFiltradas.length === 0 ? 0 : indicePrimero + 1;
  const mostrarFin = Math.min(indiceUltimo, ordenesFiltradas.length);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Titulo text="Órdenes de Trabajo" className="titulo" />
        <Button onClick={agregarOrden} className="agregar">
          Agregar Orden
        </Button>
      </div>

      {/* FILA DE CONTROLES (ARRIBA) */}
      <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-2" style={{ flex: "1" }}>
          <input
            type="text"
            placeholder="Buscar por paciente, teléfono o correo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPaginaActual(1);
            }}
            className="input-buscador"
            style={{ width: "100%" }}
          />

          <div className="flex gap-4 items-center">
            <label>
              Ordenar por:{" "}
              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value);
                  setPaginaActual(1);
                }}
                style={{ marginLeft: 6 }}
              >
                <option value="paciente">Nombre del paciente</option>
                <option value="fechaRecepcion">Fecha Recepción</option>
                <option value="fechaEntrega">Fecha Entrega</option>
                <option value="id">ID</option>
                <option value="recientes">Más recientes</option>
                <option value="viejos">Más antiguos</option>
              </select>
            </label>

            {/* Botón asc/desc */}
            <button
              type="button"
              className="btn-quick"
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortDirection === "asc" ? "A ↑" : "A ↓"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLA CON SCROLL HORIZONTAL */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenesPaginadas.length > 0 ? (
              ordenesPaginadas.map((orden) => (
                <tr key={orden.id}>
                  <td>{orden.id}</td>
                  <td>{orden.paciente}</td>
                  <td>{orden.direccion}</td>
                  <td>{orden.correo}</td>
                  <td>{orden.telefono}</td>
                  <td>{orden.fechaRecepcion}</td>
                  <td>{orden.fechaEntrega}</td>
                  <td>{orden.total}</td>
                  <td>{orden.adelanto}</td>
                  <td>{orden.saldo}</td>

                  <td>
                    <select
                      defaultValue="Acciones"
                      onChange={(e) => {
                        const accion = e.target.value;
                        if (accion === "Ver") verOrden(orden.id);
                        else if (accion === "Editar") editarOrden(orden.id);
                        else if (accion === "Eliminar") eliminarOrden(orden.id);
                        e.target.value = "Acciones";
                      }}
                    >
                      <option disabled>Acciones</option>
                      <option value="Ver">Ver</option>
                      <option value="Editar">Editar</option>
                      <option value="Eliminar">Eliminar</option>
                    </select>
                  </td>

                  <td>
                    <select
                      value={orden.notificacion}
                      onChange={(e) =>
                        handleNotificacionChange(orden.id, e.target.value)
                      }
                    >
                      <option value="Crear">Crear</option>
                      <option value="Mostrar">Mostrar</option>
                      <option value="Editar">Editar</option>
                    </select>
                  </td>

                  <td>
                    <select
                      value={orden.estado}
                      onChange={(e) =>
                        handleEstadoChange(orden.id, e.target.value)
                      }
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Realizada">Realizada</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: "center", padding: "16px", color: "#666" }}
                >
                  No hay registros disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE ABAJO */}
      <div
        className="mt-4 flex flex-col gap-1"
        style={{ alignItems: "flex-start" }}
      >
        <div>
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
        </div>

        <div>
          {ordenesFiltradas.length === 0 ? (
            "Mostrando 0 a 0 de 0 registros"
          ) : (
            <>
              Mostrando {mostrarInicio} a {mostrarFin} de {ordenesFiltradas.length} registros
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPaginaActual(Math.max(pagina - 1, 1))}
            disabled={pagina === 1}
          >
            {"<<<"}
          </Button>
          <Button
            onClick={() => setPaginaActual(Math.min(pagina + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            {">>>"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdenTrabajo;
