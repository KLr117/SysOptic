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
    console.log("🔍 Intentando obtener expedientes...");
    const expedientes = await getAllExpedientes();
    console.log("✅ Expedientes obtenidos:", expedientes.length);
    res.json({ ok: true, expedientes });
  } catch (error) {
    console.error("❌ Error detallado al obtener expedientes:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    console.error("Error errno:", error.errno);
    console.error("Error sqlState:", error.sqlState);
    console.error("Error sqlMessage:", error.sqlMessage);
    
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      details: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
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
    
    console.log('=== DATOS RECIBIDOS EN BACKEND ===');
    console.log('Correlativo:', expedienteData.correlativo);
    console.log('Nombre:', expedienteData.nombre);
    console.log('Teléfono:', expedienteData.telefono);
    console.log('Dirección:', expedienteData.direccion);
    console.log('Email:', expedienteData.email);
    console.log('Fecha Registro:', expedienteData.fecha_registro);
    console.log('==================================');
    
    // Validaciones básicas
    if (!expedienteData.correlativo || !expedienteData.nombre) {
      console.log('❌ Validación fallida: Correlativo o nombre faltante');
      return res.status(400).json({ 
        ok: false, 
        message: "Correlativo y nombre son requeridos" 
      });
    }

    // Validación de email si se proporciona
    if (expedienteData.email && !isValidEmail(expedienteData.email)) {
      console.log('❌ Validación fallida: Email inválido');
      return res.status(400).json({ 
        ok: false, 
        message: "Formato de email inválido" 
      });
    }

    console.log('🚀 Intentando crear expediente...');
    const newExpedienteId = await createExpediente(expedienteData);
    console.log('✅ Expediente creado con ID:', newExpedienteId);
    
    res.status(201).json({ 
      ok: true, 
      message: "Expediente creado correctamente", 
      pk_id_expediente: newExpedienteId 
    });
  } catch (error) {
    console.error("❌ Error detallado al crear expediente:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    console.error("Error errno:", error.errno);
    console.error("Error sqlState:", error.sqlState);
    console.error("Error sqlMessage:", error.sqlMessage);
    
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      details: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }
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
      return res.status(404).json({ ok: false, message: "Expediente no encontrado" });
    }

    // Validación de email si se proporciona
    if (expedienteData.email && !isValidEmail(expedienteData.email)) {
      console.log('❌ Validación fallida: Email inválido');
      return res.status(400).json({ 
        ok: false, 
        message: "Formato de email inválido" 
      });
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
