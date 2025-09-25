import express from "express";
import { login, createUserController } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/login", login);
router.post("/users", createUserController);

export default router;
