import express from "express";
import { login, createUserController, me } from "../controllers/AuthController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/login", login);

// Solo el rol "Administrador" puede crear usuarios
router.post("/users", authMiddleware, authorizeRoles("Administrador"), createUserController);

// Perfil autenticado
router.get("/me", authMiddleware, me);

export default router;
