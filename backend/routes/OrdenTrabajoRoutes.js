import express from "express";
import { 
  listOrders, 
  getOrder, 
  createOrderController, 
  updateOrderController, 
  deleteOrderController,
  getLastCorrelativoController
} from "../controllers/OrdenTrabajoController.js";

const router = express.Router();

// GET /api/ordenes - Listar todas las órdenes
router.get("/", listOrders);

// GET /api/ordenes/ultimo-correlativo - Obtener último correlativo para sugerencia
router.get("/ultimo-correlativo", getLastCorrelativoController);

// GET /api/ordenes/:id - Obtener una orden específica
router.get("/:id", getOrder);

// POST /api/ordenes - Crear nueva orden
router.post("/", createOrderController);

// PUT /api/ordenes/:id - Actualizar orden
router.put("/:id", updateOrderController);

// DELETE /api/ordenes/:id - Eliminar orden
router.delete("/:id", deleteOrderController);

export default router;
