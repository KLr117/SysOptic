import React, { useState, useEffect } from "react";
import "../styles/orden-trabajo.css";
import "../styles/table-responsive.css";
import "../styles/popup.css";
import Titulo from "../components/Titulo";
import Button from "../components/Button";
import PopUp from "../components/PopUp";
import { useNavigate } from "react-router-dom";
import { getOrdenes, deleteOrden } from "../services/ordenTrabajoService";

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

  const [ordenesData, setOrdenesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("fechaRecepcion");
  const [sortDirection, setSortDirection] = useState("desc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const filasOpciones = [5, 10, 20, 50];

  // Estados para PopUp
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Estado para orden a eliminar
  const [ordenAEliminar, setOrdenAEliminar] = useState(null);

  // Cargar órdenes desde el backend
  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrdenes();
        if (response.ok) {
          setOrdenesData(response.orders);
        } else {
          setError("Error al cargar las órdenes");
        }
      } catch (err) {
        console.error("Error cargando órdenes:", err);
        setError("Error al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, []);

  const agregarOrden = () => navigate("/agregar-orden-trabajo");
  const editarOrden = (id) => navigate(`/editar-orden-trabajo/${id}`);
  const verOrden = (id) => navigate(`/ver-orden-trabajo/${id}`);
  
  const confirmarEliminacion = (id) => {
    setOrdenAEliminar(id);
    setPopup({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la orden ${id}?`,
      type: 'warning',
      showButtons: true,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => eliminarOrden(id),
      onCancel: () => setOrdenAEliminar(null)
    });
  };

  const eliminarOrden = async (id) => {
    try {
      const response = await deleteOrden(id);
      if (response.ok) {
        setOrdenesData((prev) => prev.filter((o) => o.pk_id_orden !== id));
        setPopup({
          isOpen: true,
          title: 'Orden Eliminada',
          message: `La orden ${id} ha sido eliminada exitosamente.`,
          type: 'success',
          showButtons: true,
          confirmText: 'Aceptar',
          onConfirm: () => setOrdenAEliminar(null)
        });
      } else {
        setPopup({
          isOpen: true,
          title: 'Error',
          message: 'Error al eliminar la orden. Intente nuevamente.',
          type: 'error',
          showButtons: true,
          confirmText: 'Aceptar',
          onConfirm: () => setOrdenAEliminar(null)
        });
      }
    } catch (err) {
      console.error("Error eliminando orden:", err);
      setPopup({
        isOpen: true,
        title: 'Error',
        message: 'Error al eliminar la orden. Intente nuevamente.',
        type: 'error',
        showButtons: true,
        confirmText: 'Aceptar',
        onConfirm: () => setOrdenAEliminar(null)
      });
    }
  };

  const handleEstadoChange = (id, value) => {
    // TODO: Implementar actualización de estado en el backend
    console.log("Cambiar estado de orden", id, "a", value);
  };

  const handleNotificacionChange = (id, value) => {
    // TODO: Implementar actualización de notificación en el backend
    console.log("Cambiar notificación de orden", id, "a", value);
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

      if (sortField === "id") return dir * ((a.pk_id_orden || 0) - (b.pk_id_orden || 0));
      if (sortField === "paciente") {
        return dir * ((a.paciente || "").localeCompare(b.paciente || ""));
      }
      if (sortField === "fechaRecepcion" || sortField === "fechaEntrega") {
        const fieldName = sortField === "fechaRecepcion" ? "fecha_recepcion" : "fecha_entrega";
        const da = a[fieldName] ? new Date(a[fieldName]) : new Date(0);
        const db = b[fieldName] ? new Date(b[fieldName]) : new Date(0);
        return dir * (da - db);
      }
      if (sortField === "recientes") {
        return -1 * dir * (new Date(a.fecha_recepcion) - new Date(b.fecha_recepcion));
      }
      if (sortField === "viejos") {
        return dir * (new Date(a.fecha_recepcion) - new Date(b.fecha_recepcion));
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

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Titulo text="Órdenes de Trabajo" className="titulo" />
          <Button onClick={agregarOrden} className="agregar">
            Agregar Orden
          </Button>
        </div>
        <div className="text-center py-8">
          <p>Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Titulo text="Órdenes de Trabajo" className="titulo" />
          <Button onClick={agregarOrden} className="agregar">
            Agregar Orden
          </Button>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
                <tr key={orden.pk_id_orden}>
                  <td>{orden.pk_id_orden}</td>
                  <td>{orden.paciente}</td>
                  <td>{orden.direccion}</td>
                  <td>{orden.correo}</td>
                  <td>{orden.telefono}</td>
                  <td>{orden.fecha_recepcion ? new Date(orden.fecha_recepcion).toLocaleDateString('es-ES') : ''}</td>
                  <td>{orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString('es-ES') : ''}</td>
                  <td className="text-right">
                    Q{parseFloat(orden.total || 0).toFixed(2)}
                  </td>
                  <td className="text-right">
                    Q{parseFloat(orden.adelanto || 0).toFixed(2)}
                  </td>
                  <td className="text-right font-semibold bg-gray-100">
                    Q{parseFloat(orden.saldo || 0).toFixed(2)}
                  </td>

                  <td>
                    <select
                      defaultValue="Acciones"
                      onChange={(e) => {
                        const accion = e.target.value;
                        if (accion === "Ver") verOrden(orden.pk_id_orden);
                        else if (accion === "Editar") editarOrden(orden.pk_id_orden);
                        else if (accion === "Eliminar") {
                          confirmarEliminacion(orden.pk_id_orden);
                        }
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
                      defaultValue="Crear"
                      onChange={(e) =>
                        handleNotificacionChange(orden.pk_id_orden, e.target.value)
                      }
                    >
                      <option value="Crear">Crear</option>
                      <option value="Mostrar">Mostrar</option>
                      <option value="Editar">Editar</option>
                    </select>
                  </td>

                  <td>
                    <select
                      defaultValue="Pendiente"
                      onChange={(e) =>
                        handleEstadoChange(orden.pk_id_orden, e.target.value)
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

      {/* PopUp para mensajes */}
      <PopUp
        isOpen={popup.isOpen}
        onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        showButtons={popup.showButtons}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        onConfirm={popup.onConfirm}
        onCancel={popup.onCancel}
        autoClose={popup.type === 'success' && !popup.showButtons}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default OrdenTrabajo;
