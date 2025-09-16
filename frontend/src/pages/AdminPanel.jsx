import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Importar useNavigate
import Titulo from "../components/Titulo";
import "../styles/admin-panel.css";

export default function AdminPanel() {
  const navigate = useNavigate(); // <-- Inicializar navigate

  // Usuarios de ejemplo
  const [users, setUsers] = useState([
    { id: 1, firstName: "Kevin", lastName: "L", username: "admin", role: "Administrador", permisos: [] },
    { id: 2, firstName: "Wendy", lastName: "S", username: "optometrista", role: "Optometrista", permisos: [] },
    { id: 3, firstName: "Kateryn", lastName: "DL", username: "ordenes", role: "Atencion_ordenes", permisos: [] },
  ]);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    role: "",
  });

  const roles = ["Administrador", "Optometrista", "Atencion_ordenes"];

  const permisosDisponibles = [
    { key: "ver_expedientes", label: "Ver expedientes" },
    { key: "crear_expedientes", label: "Crear expedientes" },
    { key: "ver_ordenes", label: "Ver órdenes" },
    { key: "crear_ordenes", label: "Crear órdenes" },
    { key: "ver_notificaciones", label: "Ver notificaciones" },
    { key: "crear_notificaciones", label: "Crear notificaciones" },
    { key: "administrar_usuarios", label: "Administrar usuarios y roles" },
  ];

  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = users.length + 1;
    setUsers([...users, { id, ...newUser, permisos: [] }]);
    setNewUser({ firstName: "", lastName: "", username: "", password: "", role: "" });
  };

  // Abrir modal de permisos
  const assignPermissions = (user) => {
    setSelectedUser(user);
    setSelectedPerms(user.permisos || []);
    setShowPermModal(true);
  };

  const togglePerm = (perm) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const savePerms = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, permisos: selectedPerms } : u
      )
    );
    setShowPermModal(false);
  };

  // ✅ Navegar a la página de Bitácora
  const goToBitacora = () => {
    navigate("/bitacora"); // <-- Aquí se dirige a la vista Bitacora.jsx
  };

  return (
    <div className="admin-panel">
      <div className="flex-header">
        <Titulo text="Panel administrativo" size={32} className="titulo" />
        <button className="btn-bitacora" onClick={goToBitacora}>
          Ver Bitácora
        </button>
      </div>

      {/* Formulario */}
      <div className="admin-actions">
        <h3>Crear Nuevo Usuario</h3>
        <form className="user-form" onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="Nombre" value={newUser.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Apellido" value={newUser.lastName} onChange={handleChange} required />
          <input type="text" name="username" placeholder="Usuario" value={newUser.username} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={newUser.password} onChange={handleChange} required />
          <select name="role" value={newUser.role} onChange={handleChange} required>
            <option value="">Seleccione</option>
            {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
          <button type="submit">Guardar</button>
        </form>
      </div>

      {/* Tabla de usuarios */}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Apellido</th><th>Usuario</th><th>Rol</th><th>Permisos</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => assignPermissions(u)}>Asignar permisos</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal permisos */}
      {showPermModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Asignar permisos a {selectedUser.firstName} {selectedUser.lastName}</h3>
            {permisosDisponibles.map(p => (
              <label key={p.key}>
                <input type="checkbox" checked={selectedPerms.includes(p.key)} onChange={() => togglePerm(p.key)} />
                {p.label}
              </label>
            ))}
            <div>
              <button onClick={() => setShowPermModal(false)}>Cancelar</button>
              <button onClick={savePerms}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

