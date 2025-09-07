import React from "react";

const Table = ({ columns, data, onEdit, onDelete, onView }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.paciente}</td>
            <td>{row.direccion}</td>
            <td>{row.correo}</td>
            <td>{row.domiciliar}</td>
            <td>{row.telefono}</td>
            <td>{row.fechaRecepcion}</td>
            <td>{row.fechaEntrega}</td>
            <td>{row.total}</td>
            <td>{row.adelanto}</td>
            <td>{row.saldo}</td>
            <td>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value === "ver" && onView) onView(row.id);
                  if (e.target.value === "editar" && onEdit) onEdit(row.id);
                  if (e.target.value === "eliminar" && onDelete) onDelete(row.id);
                  e.target.value = ""; // reinicia el select
                }}
              >
                <option value="">Acciones</option>
                <option value="ver">Ver</option>  
                <option value="editar">Editar</option>
                <option value="eliminar">Eliminar</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
