import express from "express";
import { loginUnificado } from "../controllers/auth.controller.js";
import { registerTurista } from "../controllers/authturistas.controller.js";

const router = express.Router();

router.post("/login", loginUnificado);
router.post("/register", registerTurista);

export default router;