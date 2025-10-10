import express from "express";
import {
  listOrders,
  getOrder,
  createOrderController,
  updateOrderController,
  deleteOrderController,
  getLastCorrelativoController,
} from "../controllers/OrdenTrabajoController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

// GET /api/ordenes - Listar todas las órdenes
router.get("/", authorizeModules("control_ordenes"), listOrders);

// GET /api/ordenes/ultimo-correlativo - Obtener último correlativo para sugerencia
router.get(
  "/ultimo-correlativo",
  authorizeModules("control_ordenes"),
  getLastCorrelativoController
);

// GET /api/ordenes/:id - Obtener una orden específica
router.get("/:id", authorizeModules("control_ordenes"), getOrder);

// POST /api/ordenes - Crear nueva orden
router.post("/", authorizeModules("control_ordenes"), createOrderController);

// PUT /api/ordenes/:id - Actualizar orden
router.put("/:id", authorizeModules("control_ordenes"), updateOrderController);

// DELETE /api/ordenes/:id - Eliminar orden
router.delete(
  "/:id",
  authorizeModules("control_ordenes"),
  deleteOrderController
);

export default router;
