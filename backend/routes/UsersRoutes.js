import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
} from "../controllers/UsersController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/Auth.js";

const router = express.Router();

// 🧩 Todas las rutas requieren autenticación
router.use(authMiddleware);

// ✅ Listar todos los usuarios (solo Admin)
router.get("/", authorizeRoles("Administrador"), getUsers);

// ✅ Obtener un usuario específico (solo Admin)
router.get("/:id", authorizeRoles("Administrador"), getUser);

// ✅ Crear nuevo usuario (solo Admin)
router.post("/", authorizeRoles("Administrador"), createUser);

// ✅ Actualizar datos de usuario (solo Admin)
router.put("/:id", authorizeRoles("Administrador"), updateUser);

// ✅ Cambiar contraseña (solo Admin)
router.put("/:id/password", authorizeRoles("Administrador"), changePassword);

// ✅ Eliminar usuario (solo Admin)
router.delete("/:id", authorizeRoles("Administrador"), deleteUser);

export default router;
