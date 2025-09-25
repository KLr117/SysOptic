import express from "express";
import { healthCheck, dbCheck, getStats } from "../controllers/SystemController.js";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/db-check", dbCheck);
router.get("/stats", getStats);

export default router;
