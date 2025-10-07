import { 
  getAllExpedientes, 
  getExpedienteById, 
  createExpediente, 
  updateExpediente, 
  deleteExpediente 
} from "../models/ExpedientesModel.js";

// Listar todos los expedientes
export const listExpedientes = async (req, res) => {
  try {
    const expedientes = await getAllExpedientes();
    res.json({ ok: true, expedientes });
  } catch (error) {
    console.error("Error al obtener expedientes:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Obtener un expediente por pk_id_expediente
export const getExpediente = async (req, res) => {
  try {
    const { pk_id_expediente } = req.params;
    const expediente = await getExpedienteById(pk_id_expediente);

    if (!expediente) {
      return res.status(404).json({ ok: false, message: "Expediente no encontrado" });
    }

    res.json({ ok: true, expediente });
  } catch (error) {
    console.error("Error al obtener expediente:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Crear un nuevo expediente (SIN FOTOS por ahora)
export const createExpedienteController = async (req, res) => {
  try {
    // Solo campos de texto por ahora
    const expedienteData = {
      correlativo: req.body.correlativo,
      nombre: req.body.nombre,
      telefono: req.body.telefono,
      direccion: req.body.direccion,
      email: req.body.email,
      fecha_registro: req.body.fecha_registro
    };

    // Validaciones básicas
    if (!expedienteData.correlativo || !expedienteData.nombre) {
      return res.status(400).json({ 
        ok: false, 
        message: "Correlativo y nombre son requeridos" 
      });
    }

    const newExpedienteId = await createExpediente(expedienteData);

    res.status(201).json({ 
      ok: true, 
      message: "Expediente creado correctamente", 
      pk_id_expediente: newExpedienteId 
    });
  } catch (error) {
    console.error("Error al crear expediente:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Actualizar expediente existente (SIN FOTOS por ahora)
export const updateExpedienteController = async (req, res) => {
  try {
    const { pk_id_expediente } = req.params;
    
    const expedienteData = {
      correlativo: req.body.correlativo,
      nombre: req.body.nombre,
      telefono: req.body.telefono,
      direccion: req.body.direccion,
      email: req.body.email,
      fecha_registro: req.body.fecha_registro
    };

    const existingExpediente = await getExpedienteById(pk_id_expediente);
    if (!existingExpediente) {
      return res.status(404).json({ ok: false, message: "Expediente no encontrado" });
    }

    const success = await updateExpediente(pk_id_expediente, expedienteData);

    if (success) {
      res.json({ ok: true, message: "Expediente actualizado correctamente" });
    } else {
      res.status(500).json({ ok: false, message: "Error al actualizar el expediente" });
    }
  } catch (error) {
    console.error("Error al actualizar expediente:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Eliminar expediente
export const deleteExpedienteController = async (req, res) => {
  try {
    const { pk_id_expediente } = req.params;

    const existingExpediente = await getExpedienteById(pk_id_expediente);
    if (!existingExpediente) {
      return res.status(404).json({ ok: false, message: "Expediente no encontrado" });
    }

    const success = await deleteExpediente(pk_id_expediente);

    if (success) {
      res.json({ ok: true, message: "Expediente eliminado correctamente" });
    } else {
      res.status(500).json({ ok: false, message: "Error al eliminar el expediente" });
    }
  } catch (error) {
    console.error("Error al eliminar expediente:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};