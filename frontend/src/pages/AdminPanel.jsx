import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Titulo from '../components/Titulo';
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser as deleteUserService,
  changePassword as changePasswordService,
} from '../services/adminService';
import '../styles/admin-panel.css';
import '../styles/tables.css';
import '../styles/theme.css';

export default function AdminPanel() {
  const navigate = useNavigate();

  // Estado para el modo oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar el modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Usuarios del backend
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [editUser, setEditUser] = useState({
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const roles = ['Administrador', 'Optometrista', 'Atencion_ordenes'];

  const permisosDisponibles = [
    { key: 'ver_expedientes', label: 'Ver expedientes' },
    { key: 'crear_expedientes', label: 'Crear expedientes' },
    { key: 'ver_ordenes', label: 'Ver órdenes' },
    { key: 'crear_ordenes', label: 'Crear órdenes' },
    { key: 'ver_notificaciones', label: 'Ver notificaciones' },
    { key: 'crear_notificaciones', label: 'Crear notificaciones' },
    { key: 'administrar_usuarios', label: 'Administrar usuarios y roles' },
  ];

  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mapear roleId a nombre de rol
  const getRoleName = (roleId) => {
    const roleMap = {
      1: 'Administrador',
      2: 'Optometrista',
      3: 'Atencion_ordenes',
    };
    return roleMap[roleId] || 'Desconocido';
  };

  // Mapear nombre de rol a roleId
  const getRoleId = (roleName) => {
    const roleMap = {
      Administrador: 1,
      Optometrista: 2,
      Atencion_ordenes: 3,
    };
    return roleMap[roleName];
  };

  // Cargar usuarios del backend al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers();
        if (response.ok && response.rows) {
          const formattedUsers = response.rows.map((user) => ({
            id: user.pk_id_user,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            role: getRoleName(user.fk_id_role),
            roleId: user.fk_id_role,
            permisos: [],
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar la lista de usuarios');
        setTimeout(() => setError(null), 5000);
      }
    };

    loadUsers();
  }, []);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!newUser.firstName || !newUser.username || !newUser.password || !newUser.role) {
        throw new Error('Todos los campos marcados con * son obligatorios');
      }

      if (newUser.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (newUser.password !== newUser.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName || '',
        username: newUser.username,
        password: newUser.password,
        roleId: getRoleId(newUser.role),
      };

      const response = await createUser(userData);

      if (response.ok) {
        const newUserWithId = {
          id: response.data?.id || users.length + 1,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
          role: newUser.role,
          roleId: getRoleId(newUser.role),
          permisos: [],
        };

        setUsers([...users, newUserWithId]);
        setNewUser({
          firstName: '',
          lastName: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
        });
        setSuccess(response.message || 'Usuario creado exitosamente');

        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setError(error.message || 'Error al crear el usuario');

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
      prev.map((u) => (u.id === selectedUser.id ? { ...u, permisos: selectedPerms } : u))
    );
    setShowPermModal(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteUserService(id);

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setSuccess(response.message || 'Usuario eliminado correctamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError(error.message || 'Error al eliminar el usuario');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición
  const handleEditUser = (user) => {
    setEditUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowPasswordSection(false);
    setShowEditModal(true);
  };

  // Actualizar datos básicos del usuario
  const handleUpdateUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!editUser.firstName || !editUser.username || !editUser.role) {
        throw new Error('Los campos nombre, usuario y rol son obligatorios');
      }

      const userData = {
        firstName: editUser.firstName,
        lastName: editUser.lastName || '',
        username: editUser.username,
        roleId: getRoleId(editUser.role),
      };

      const response = await updateUser(editUser.id, userData);

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editUser.id
              ? {
                  ...u,
                  firstName: editUser.firstName,
                  lastName: editUser.lastName,
                  username: editUser.username,
                  role: editUser.role,
                  roleId: getRoleId(editUser.role),
                }
              : u
          )
        );
        setSuccess(response.message || 'Usuario actualizado correctamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError(error.message || 'Error al actualizar el usuario');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña del usuario
  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!editUser.newPassword) {
        throw new Error('Debe ingresar una nueva contraseña');
      }

      if (editUser.newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (editUser.newPassword !== editUser.confirmNewPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const response = await changePasswordService(editUser.id, editUser.newPassword);

      if (response.ok) {
        setSuccess(response.message || 'Contraseña actualizada correctamente');
        setEditUser({ ...editUser, newPassword: '', confirmNewPassword: '' });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.message || 'Error al cambiar la contraseña');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navegar a la página de Bitácora
  const goToBitacora = () => {
    navigate('/bitacora');
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <div className="header-title">
          <Titulo text="Panel Administrativo" className="titulo" />
        </div>
        <div className="header-buttons">
          <button className="btn-mostrar-usuarios" onClick={() => setShowUsersModal(true)}>
            👥 Mostrar Usuarios
          </button>
          <button className="btn-bitacora" onClick={goToBitacora}>
            📋 Ver Bitácora
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
              <select id="role" name="role" value={newUser.role} onChange={handleChange} required>
                <option value="">Seleccione un rol</option>
                {roles.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese la contraseña"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  {showPassword ? '👁' : '🔒'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirme la contraseña"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  {showConfirmPassword ? '👁' : '🔒'}
                </button>
              </div>
            </div>
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
                setNewUser({
                  firstName: '',
                  lastName: '',
                  username: '',
                  password: '',
                  confirmPassword: '',
                  role: '',
                });
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
              <h3>📋 Gestión de Usuarios del Sistema</h3>
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
                    {users.map((u) => (
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
                              onClick={() => handleEditUser(u)}
                              title="Editar usuario"
                              disabled={loading}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Eliminar usuario"
                              disabled={loading}
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
              <h3>
                Asignar permisos a {selectedUser?.firstName} {selectedUser?.lastName}
              </h3>
              <button className="modal-close" onClick={() => setShowPermModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="permissions-list">
                {permisosDisponibles.map((p) => (
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
                        <div className="permission-description">
                          Permiso para {p.label.toLowerCase()}
                        </div>
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

      {/* Modal de edición de usuario */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container users-modal">
            <div className="modal-header edit-user-header">
              <h3>✏️ Editar Información del Usuario</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
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

              <form className="usuario-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editFirstName">Nombre *</label>
                    <input
                      type="text"
                      id="editFirstName"
                      value={editUser.firstName}
                      onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                      placeholder="Ingrese el nombre"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editLastName">Apellido</label>
                    <input
                      type="text"
                      id="editLastName"
                      value={editUser.lastName}
                      onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                      placeholder="Ingrese el apellido"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editUsername">Usuario *</label>
                    <input
                      type="text"
                      id="editUsername"
                      value={editUser.username}
                      onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                      placeholder="Ingrese el nombre de usuario"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editRole">Rol *</label>
                    <select
                      id="editRole"
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map((r, i) => (
                        <option key={i} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleUpdateUser}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Datos'
                    )}
                  </button>
                </div>
              </form>

              <hr style={{ margin: '30px 0', border: '1px solid #ddd' }} />

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
                >
                  <input
                    type="checkbox"
                    checked={showPasswordSection}
                    onChange={(e) => setShowPasswordSection(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>¿Desea actualizar la contraseña?</span>
                </label>
              </div>

              {showPasswordSection && (
                <>
                  <h4 style={{ marginBottom: '15px' }}>Cambiar Contraseña</h4>
                  <form className="usuario-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="editNewPassword">Nueva Contraseña</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            id="editNewPassword"
                            value={editUser.newPassword}
                            onChange={(e) =>
                              setEditUser({ ...editUser, newPassword: e.target.value })
                            }
                            placeholder="Ingrese nueva contraseña"
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '18px',
                            }}
                          >
                            {showNewPassword ? '👁' : '🔒'}
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="editConfirmNewPassword">Confirmar Contraseña</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            id="editConfirmNewPassword"
                            value={editUser.confirmNewPassword}
                            onChange={(e) =>
                              setEditUser({ ...editUser, confirmNewPassword: e.target.value })
                            }
                            placeholder="Confirme nueva contraseña"
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '18px',
                            }}
                          >
                            {showConfirmNewPassword ? '👁' : '🔒'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleChangePassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="loading-spinner"></span>
                            Cambiando...
                          </>
                        ) : (
                          'Cambiar Contraseña'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
