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

// GET /api/expedientes/:id - Obtener un expediente específico
router.get("/:id", getExpediente);

// POST /api/expedientes - Crear nuevo expediente
router.post("/", createExpedienteController);

// PUT /api/expedientes/:id - Actualizar expediente
router.put("/:id", updateExpedienteController);

// DELETE /api/expedientes/:id - Eliminar expediente
router.delete("/:id", deleteExpedienteController);

export default router;
