/// ===============   WENDYs    ================
import React, { useState, useEffect } from "react";
import "../styles/vista-expedientes.css"; 

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState("");

  // Estado para el formulario
  const [formData, setFormData] = useState({
    noCorrelativo: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    fecha: "",
    correo: "",
    direccion: "",
  });

  // Cargar expedientes desde localStorage al iniciar
  useEffect(() => {
    const expedientesGuardados = localStorage.getItem("expedientes");
    if (expedientesGuardados) {
      setExpedientes(JSON.parse(expedientesGuardados));
    }
  }, []);

  // Guardar expedientes en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("expedientes", JSON.stringify(expedientes));
  }, [expedientes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editando) {
      // Editar expediente existente
      const expedientesActualizados = expedientes.map(exp => 
        exp.numeroRegistro === editando ? formData : exp);
      setExpedientes(expedientesActualizados);
      setEditando(null);
      alert("Expediente actualizado correctamente");
      
      // Limpiar formulario y volver a vista de búsqueda
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
    } else {
      // Crear nuevo expediente
      // Verificar si el número de registro ya existe
      const existe = expedientes.some(exp => exp.numeroRegistro === formData.numeroRegistro);
      if (existe) {
        alert("El número de registro ya existe. Por favor, use otro.");
        return;
      }
      
      setExpedientes([...expedientes, formData]);
      alert("Expediente guardado correctamente");
      
      // Limpiar formulario pero mantenerlo abierto
      setFormData({
        noCorrelativo: "",
        nombre: "",
        apellidos: "",
        telefono: "",
        fecha: "",
        correo: "",
        direccion: "",
      });
    }
  };

  const handleEditar = (expediente) => {
    setFormData(expediente);
    setEditando(expediente.numeroRegistro);
    setMostrarFormulario(true);
  };

  const handleEliminar = (numeroRegistro) => {
    if (window.confirm("¿Está seguro de que desea eliminar este expediente?")) {
      const expedientesFiltrados = expedientes.filter(exp => exp.numeroRegistro !== numeroRegistro);
      setExpedientes(expedientesFiltrados);
      alert("Expediente eliminado correctamente");
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

  const handleSalir = () => {
    handleCancelar(); // Limpia el formulario y sale
  };

  // Filtrar expedientes
  const expedientesFiltrados = expedientes.filter(exp => 
    exp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    exp.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    exp.numeroRegistro.includes(filtro)
  );

  return (
    <div className="p-6 expedientes-container">
      <h1 className="text-2xl font-bold mb-6">Expedientes de Pacientes</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => setMostrarFormulario(true)}
          className="btn-primary"
        >
          Nuevo Expediente
        </button>
        
        <div className="w-64">
          <input
            type="text"
            placeholder="Buscar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div className="p-6 rounded-lg shadow-md mb-6 formulario-expediente">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editando ? "Editar Expediente" : "Nuevo Expediente"}
            </h2>
          </div>
          
<form onSubmit={handleSubmit} className="formulario-paciente">
  {/* Fila superior: Fecha (izquierda) y No. Orden (derecha) */}
  <div className="fila-superior">
    <div className="campo-formulario">
      <label className="block text-sm font-medium text-gray-700">Fecha *</label>
      <input
        type="text"
        name="fecha"
        value={formData.fecha}
        onChange={handleInputChange}
        required
        placeholder="DD/MM/AAAA"
        className="input-formulario"
      />
    </div>
    
    <div className="campo-formulario">
      <label className="block text-sm font-medium text-gray-700">No. Correlativo</label>
      <input
        type="text"
        name="noCorrelativo"
        value={formData.noOrden}
        onChange={handleInputChange}
        placeholder="Ej: 003"
        className="input-formulario"
      />
    </div>
  </div>
  

  
  {/* Segunda fila: Nombre (izquierda) y Teléfono (derecha) */}
  <div className="fila-formulario">
    <div className="campo-formulario">
      <label className="block text-sm font-medium text-gray-700">Nombre *</label>
      <input
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={handleInputChange}
        required
        className="input-formulario"
      />
    </div>
    
    <div className="campo-formulario">
      <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
      <input
        type="tel"
        name="telefono"
        value={formData.telefono}
        onChange={handleInputChange}
        required
        className="input-formulario"
      />
    </div>
  </div>
  
  {/* Cuarta fila: Email (todo el ancho) */}
  <div className="fila-formulario">
    <div className="campo-formulario ancho-completo">
      <label className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
      <input
        type="email"
        name="correo"
        value={formData.correo}
        onChange={handleInputChange}
        required
        className="input-formulario"
      />
    </div>
  </div>
  
  {/* Quinta fila: Dirección (todo el ancho) */}
  <div className="fila-formulario">
    <div className="campo-formulario ancho-completo">
      <label className="block text-sm font-medium text-gray-700">Dirección *</label>
      <input
        type="text"
        name="direccion"
        value={formData.direccion}
        onChange={handleInputChange}
        required
        className="input-formulario"
      />
    </div>
  </div>
  
  {/* Botones de acción */}
  <div className="botones-formulario">
    <button
      type="button"
      onClick={handleCancelar}
      className="btn-secondary"
    >
      Cancelar
    </button>
    <button
      type="submit"
      className="btn-success"
    >
      {editando ? "Actualizar" : "Guardar"}
    </button>
  </div>
</form>

          {/* Botón de salir en la parte inferior izquierda */}
          <div className="mt-6 flex justify-start">
            <button
              onClick={handleSalir}
              className="btn-salir"
            >
              Salir a Búsqueda
            </button>
          </div>
        </div>
      )}

      {/* Mostrar tabla solo cuando hay expedientes o cuando se está buscando */}
      {(expedientes.length > 0 || filtro) && (
        <div className="bg-white rounded-lg shadow overflow-hidden tabla-expedientes">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Correlativo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expedientesFiltrados.length > 0 ? (
                expedientesFiltrados.map((expediente) => (
                  <tr key={expediente.numeroRegistro}>
                    <td className="px-6 py-4 whitespace-nowrap">{expediente.noCorrelativo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expediente.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expediente.apellidos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expediente.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expediente.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditar(expediente)}
                        className="btn-edit mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(expediente.numeroRegistro)}
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron expedientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}