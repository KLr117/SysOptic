import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
} from "../controllers/UsersController.js";
import { authorizeModules } from "../middlewares/Auth.js";

const router = express.Router();

// ✅ Listar todos los usuarios (solo Admin)
router.get("/", authorizeModules("control_admin"), getUsers);

// ✅ Obtener un usuario específico (solo Admin)
router.get("/:id", authorizeModules("control_admin"), getUser);

// ✅ Crear nuevo usuario (solo Admin)
router.post("/", authorizeModules("control_admin"), createUser);

// ✅ Actualizar datos de usuario (solo Admin)
router.put("/:id", authorizeModules("control_admin"), updateUser);

// ✅ Cambiar contraseña (solo Admin)
router.put("/:id/password", authorizeModules("control_admin"), changePassword);

// ✅ Eliminar usuario (solo Admin)
router.delete("/:id", authorizeModules("control_admin"), deleteUser);

export default router;
