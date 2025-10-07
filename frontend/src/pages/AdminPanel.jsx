import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Titulo from "../components/Titulo";
import { createUser, getUsers, updateUser, deleteUser } from "../services/adminService";
import "../styles/admin-panel.css";
import "../styles/tables.css";
import "../styles/theme.css";

export default function AdminPanel() {
  const navigate = useNavigate(); // <-- Inicializar navigate

  // Estado para el modo oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar el modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    // Verificar al cargar
    checkDarkMode();

    // Observar cambios en el tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

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
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar campos requeridos
      if (!newUser.firstName || !newUser.username || !newUser.password || !newUser.role) {
        throw new Error('Todos los campos marcados con * son obligatorios');
      }

      // Crear el usuario
      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName || '',
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      };

      const response = await createUser(userData);
      
      if (response.success) {
        // Agregar el nuevo usuario a la lista local
        const newUserWithId = {
          id: response.user.id || users.length + 1,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
          role: newUser.role,
          estado: 'activo',
          permisos: []
        };
        
        setUsers([...users, newUserWithId]);
        setNewUser({ firstName: "", lastName: "", username: "", password: "", role: "" });
        setSuccess('Usuario creado exitosamente');
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setError(error.message || 'Error al crear el usuario');
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
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

  const deleteUser = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // ✅ Navegar a la página de Bitácora
  const goToBitacora = () => {
    navigate("/bitacora"); // <-- Aquí se dirige a la vista Bitacora.jsx
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>Panel Administrativo</h1>
        <div className="header-buttons">
          <button 
            className="btn-mostrar-usuarios"
            onClick={() => setShowUsersModal(true)}
          >
            👥 Mostrar Usuarios
          </button>
          <button className="btn-bitacora" onClick={goToBitacora}>
            Ver Bitácora
          </button>
        </div>
      </div>

      {/* Formulario principal para crear usuario */}
      <div className="main-form-container">
        <h2>
          <span className="form-icon">👨‍💼</span>
          Crear Nuevo Usuario
        </h2>
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        <form className="usuario-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nombre *</label>
              <input 
                type="text" 
                id="firstName"
                name="firstName" 
                value={newUser.firstName} 
                onChange={handleChange} 
                required 
                placeholder="Ingrese el nombre"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input 
                type="text" 
                id="lastName"
                name="lastName" 
                value={newUser.lastName} 
                onChange={handleChange} 
                placeholder="Ingrese el apellido"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Usuario *</label>
              <input 
                type="text" 
                id="username"
                name="username" 
                value={newUser.username} 
                onChange={handleChange} 
                required 
                placeholder="Ingrese el nombre de usuario"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Rol *</label>
              <select 
                id="role"
                name="role" 
                value={newUser.role} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione un rol</option>
                {roles.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              value={newUser.password} 
              onChange={handleChange} 
              required 
              placeholder="Ingrese la contraseña"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => {
                setNewUser({firstName: "", lastName: "", username: "", password: "", role: ""});
                setError(null);
                setSuccess(null);
              }}
              disabled={loading}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>


      {/* Modal de tabla de usuarios */}
      {showUsersModal && (
        <div className="modal-overlay">
          <div className="modal-container users-modal">
            <div className="modal-header">
              <h3>Lista de Usuarios</h3>
              <button className="modal-close" onClick={() => setShowUsersModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.firstName}</td>
                        <td>{u.lastName}</td>
                        <td>{u.username}</td>
                        <td>
                          <span className={`role-badge role-${u.role.toLowerCase()}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge status-activo">Activo</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit"
                              onClick={() => assignPermissions(u)}
                              title="Asignar permisos"
                            >
                              ⚙️
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => deleteUser(u.id)}
                              title="Eliminar usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal permisos */}
      {showPermModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Asignar permisos a {selectedUser?.firstName} {selectedUser?.lastName}</h3>
              <button className="modal-close" onClick={() => setShowPermModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="permissions-list">
                {permisosDisponibles.map(p => (
                  <div key={p.key} className="permission-item">
                    <label className="permission-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedPerms.includes(p.key)} 
                        onChange={() => togglePerm(p.key)} 
                      />
                      <span className="checkmark"></span>
                      <div className="permission-info">
                        <div className="permission-name">{p.label}</div>
                        <div className="permission-description">Permiso para {p.label.toLowerCase()}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPermModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={savePerms}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

