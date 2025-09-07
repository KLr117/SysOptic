import React, { useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import "../styles/orden-trabajo.css";
import { useNavigate } from "react-router-dom";
import Titulo from "../components/Titulo"; // 👈 Importamos el componente Titulo

const OrdenTrabajo = () => {
  const navigate = useNavigate();

  const columns = [
    "No Orden",
    "Paciente",
    "Dirección",
    "Correo",
    "Domiciliar",
    "Teléfono",
    "Fecha Recepción",
    "Fecha Entrega",
    "Total",
    "Adelanto",
    "Saldo",
  ];

  // Datos dummy
  const [ordenesData] = useState([
    {
      id: 1,
      paciente: "Juan Pérez",
      direccion: "Calle 123",
      correo: "juan@example.com",
      domiciliar: "Sí",
      telefono: "555-1234",
      fechaRecepcion: "04/09/2025",
      fechaEntrega: "10/09/2025",
      total: 150,
      adelanto: 50,
      saldo: 100,
    },
    {
      id: 2,
      paciente: "María López",
      direccion: "Av. Central 456",
      correo: "maria@example.com",
      domiciliar: "No",
      telefono: "555-5678",
      fechaRecepcion: "03/09/2025",
      fechaEntrega: "09/09/2025",
      total: 200,
      adelanto: 100,
      saldo: 100,
    },
  ]);

  const [search, setSearch] = useState(""); // Estado del buscador

  // Filtrado de la tabla
  const filteredData = ordenesData.filter((orden) =>
    orden.paciente.toLowerCase().includes(search.toLowerCase())
  );

  // Navegar a la vista para agregar
  const agregarOrden = () => {
    navigate("/agregar-orden-trabajo");
  };

  // Navegar a la vista para editar
  const editarOrden = (id) => {
    navigate("/editar-orden-trabajo");
  };

   // Navegar a la vista para ver 
  const verOrden = (id) => {
    navigate(`/ver-orden-trabajo/${id}`); // ✅ Nueva ruta
  };

  const eliminarOrden = (id) => alert(`Eliminar orden ${id} (dummy)`);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {/* 🔹 Título centrado */}
        <Titulo text="Órdenes de Trabajo" className="titulo" />

        <Button onClick={agregarOrden} className="agregar">
          Agregar Orden
        </Button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-buscador"
        />
      </div>

      <Table
        columns={columns}
        data={filteredData}
        onEdit={editarOrden}
        onDelete={eliminarOrden}
        onView={verOrden} // 👈 Le pasamos el nuevo handler al componente Table
      />
    </div>
  );
};

export default OrdenTrabajo;
