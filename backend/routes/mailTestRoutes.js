// routes/mailTestRoutes.js
import express from "express";
import { testMail } from "../controllers/mailTestController.js";

const router = express.Router();

// POST /api/mail/test
router.post("/test", testMail);

export default router;
