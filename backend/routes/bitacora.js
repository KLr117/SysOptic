import express from "express";
import { listarBitacora } from "../controllers/bitacora.js";

const router = express.Router();

// Obtener bitácora con nombres de usuarios
router.get("/", listarBitacora);

export default router;