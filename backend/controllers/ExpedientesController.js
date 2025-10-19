import { 
  getAllExpedientes, 
  getExpedienteById, 
  createExpediente, 
  updateExpediente, 
  deleteExpediente,
  getLastCorrelativoExpediente
} from "../models/ExpedientesModel.js";


export const listExpedientes = async (req, res) => {
  try {
    const expedientes = await getAllExpedientes();
    res.json({ ok: true, expedientes });
  } catch (error) {
    console.error("Error al obtener expedientes:", error);
    res.status(500).json({ 
      ok: false, 
      error: error.message
    });
  }
};

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

export const createExpedienteController = async (req, res) => {
  try {
    const expedienteData = req.body;
    
    // Validaciones básicas
    if (!expedienteData.correlativo || expedienteData.correlativo.toString().trim() === '') {
      return res.status(400).json({ 
        ok: false, 
        message: "El campo correlativo es requerido" 
      });
    }
    
    if (!expedienteData.nombre || expedienteData.nombre.trim() === '') {
      return res.status(400).json({ 
        ok: false, 
        message: "El campo nombre es requerido" 
      });
    }

    // Validación de email si se proporciona
    if (expedienteData.email && expedienteData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(expedienteData.email)) {
        return res.status(400).json({ 
          ok: false, 
          message: "Formato de email inválido" 
        });
      }
    }

    const newExpedienteId = await createExpediente(expedienteData);
    
    res.status(201).json({ 
      ok: true, 
      message: "Expediente creado correctamente", 
      pk_id_expediente: newExpedienteId 
    });
  } catch (error) {
    console.error("Error al crear expediente:", error);
    
    // Manejar específicamente el error de correlativo duplicado
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage && error.sqlMessage.includes('correlativo')) {
      return res.status(400).json({ 
        ok: false, 
        message: "Este correlativo ya está ingresado. Por favor, use un número diferente."
      });
    }
    
    res.status(500).json({ 
      ok: false, 
      error: error.message
    });
  }
};

export const updateExpedienteController = async (req, res) => {
  try {
    const { pk_id_expediente } = req.params;
    const expedienteData = req.body;
    

    // Verificar que el expediente existe
    const existingExpediente = await getExpedienteById(pk_id_expediente);
    if (!existingExpediente) {
      console.log('❌ Expediente no encontrado:', pk_id_expediente);
      return res.status(404).json({ ok: false, message: "Expediente no encontrado" });
    }

    // Validación de email si se proporciona
    if (expedienteData.email && expedienteData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(expedienteData.email)) {
        return res.status(400).json({ 
          ok: false, 
          message: "Formato de email inválido" 
        });
      }
    }

    const success = await updateExpediente(pk_id_expediente, expedienteData);
    
    if (success) {
      res.json({ ok: true, message: "Expediente actualizado correctamente" });
    } else {
      res.status(500).json({ ok: false, message: "Error al actualizar el expediente" });
    }
  } catch (error) {
    console.error("Error al actualizar expediente:", error);
    
    // Manejar específicamente el error de correlativo duplicado
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage && error.sqlMessage.includes('correlativo')) {
      return res.status(400).json({ 
        ok: false, 
        message: "Este correlativo ya está ingresado. Por favor, use un número diferente."
      });
    }
    
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const deleteExpedienteController = async (req, res) => {
  try {
    const { pk_id_expediente } = req.params;

    // Verificar que el expediente existe
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

// Obtener el último correlativo para sugerir el siguiente
export const getLastCorrelativoExpedienteController = async (req, res) => {
  try {
    const lastCorrelativo = await getLastCorrelativoExpediente();
    
    // El siguiente correlativo será el último + 1
    const siguiente = lastCorrelativo + 1;
    
    res.json({ 
      ok: true, 
      ultimoCorrelativo: lastCorrelativo,
      sugerencia: siguiente
    });
  } catch (error) {
    console.error("Error al obtener último correlativo de expediente:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
