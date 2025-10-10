import express from "express";
import { login, me } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/login", login);

// Perfil autenticado
router.get("/me", authMiddleware, me);

export default router;
