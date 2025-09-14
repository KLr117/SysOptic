import React, { useState } from "react"; 
import "../styles/orden-trabajo.css";
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
    "Estado", // Columna de estado
    "Acciones",
    "Notificaciones", // Nueva funcionalidad
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const filasOpciones = [5, 10, 20, 50];

  const agregarOrden = () => navigate("/agregar-orden-trabajo");
  const editarOrden = (id) => navigate("/editar-orden-trabajo");
  const verOrden = (id) => navigate(`/ver-orden-trabajo/${id}`);
  const eliminarOrden = (id) => {
    if (window.confirm(`¿Eliminar la orden ${id}?`)) {
      setOrdenesData(ordenesData.filter((o) => o.id !== id));
    }
  };

  const handleEstadoChange = (id, value) => {
    setOrdenesData(
      ordenesData.map((o) => (o.id === id ? { ...o, estado: value } : o))
    );
  };

  const handleNotificacionChange = (id, value) => {
    setOrdenesData(
      ordenesData.map((o) => (o.id === id ? { ...o, notificacion: value } : o))
    );
  };

  // Filtrado inteligente
  const filteredData = ordenesData.filter((orden) => {
    const query = search.toLowerCase().trim();
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(query);
    if (isDate) {
      return orden.fechaRecepcion === query || orden.fechaEntrega === query;
    } else {
      return orden.paciente.toLowerCase().includes(query);
    }
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const startRecord = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, filteredData.length);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Titulo text="Órdenes de Trabajo" className="titulo" />
        <Button onClick={agregarOrden} className="agregar">Agregar Orden</Button>
      </div>

      {/* Búsqueda */}
      <div className="mb-2 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por paciente o fecha (YYYY-MM-DD)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="input-buscador"
          style={{ flexGrow: 1, minWidth: "200px" }}
        />
      </div>

      {/* Información unificada con selector de filas */}
      <div className="data-info-box mb-4">
        {filteredData.length === 0 ? (
          "No hay registros"
        ) : (
          <>
            Mostrando {startRecord} - {endRecord} de {filteredData.length} registros{" "}
            | Filas por página:{" "}
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {filasOpciones.map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Tabla de órdenes */}
      <table className="users-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((orden) => (
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

              {/* Columna Estado */}
              <td>
                <select
                  value={orden.estado}
                  onChange={(e) => handleEstadoChange(orden.id, e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Realizada">Realizada</option>
                </select>
              </td>

              {/* Acciones */}
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

              {/* Notificaciones con nuevo desplegable */}
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-center mt-4 gap-2">
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span className="p-2">
          Página {currentPage} de {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default OrdenTrabajo;
