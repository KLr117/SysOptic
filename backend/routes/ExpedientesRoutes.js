import express from "express";
import { 
  listExpedientes, 
  getExpediente, 
  createExpedienteController, 
  updateExpedienteController, 
  deleteExpedienteController
} from "../controllers/expedientesController.js";

const router = express.Router();

// GET /api/expedientes - Listar todos los expedientes
router.get("/", listExpedientes);

// GET /api/expedientes/:pk_id_expediente - Obtener un expediente específico
router.get("/:pk_id_expediente", getExpediente);

// POST /api/expedientes - Crear nuevo expediente
router.post("/", createExpedienteController);

// PUT /api/expedientes/:pk_id_expediente - Actualizar expediente
router.put("/:pk_id_expediente", updateExpedienteController);

// DELETE /api/expedientes/:pk_id_expediente - Eliminar expediente
router.delete("/:pk_id_expediente", deleteExpedienteController);

export default router;