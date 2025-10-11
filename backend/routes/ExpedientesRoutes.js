import express from "express";
import {
  listExpedientes,
  getExpediente,
  createExpedienteController,
  updateExpedienteController,
  deleteExpedienteController,
  getLastCorrelativoExpedienteController,
} from "../controllers/ExpedientesController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

// GET /api/expedientes - Listar todos los expedientes
router.get("/", authorizeModules("control_expedientes"), listExpedientes);

// GET /api/expedientes/ultimo-correlativo - Obtener último correlativo para sugerencia
router.get(
  "/ultimo-correlativo",
  authorizeModules("control_expedientes"),
  getLastCorrelativoExpedienteController
);

// GET /api/expedientes/:pk_id_expediente - Obtener un expediente específico
router.get(
  "/:pk_id_expediente",
  authorizeModules("control_expedientes"),
  getExpediente
);

// POST /api/expedientes - Crear nuevo expediente
router.post(
  "/",
  authorizeModules("control_expedientes"),
  createExpedienteController
);

// PUT /api/expedientes/:pk_id_expediente - Actualizar expediente
router.put(
  "/:pk_id_expediente",
  authorizeModules("control_expedientes"),
  updateExpedienteController
);

// DELETE /api/expedientes/:pk_id_expediente - Eliminar expediente
router.delete(
  "/:pk_id_expediente",
  authorizeModules("control_expedientes"),
  deleteExpedienteController
);

export default router;
