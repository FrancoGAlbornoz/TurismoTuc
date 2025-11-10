// backend/routes/contactoRoutes.js
import express from "express";
import { enviarContacto } from "../controllers/contacto.controller.js";

const router = express.Router();
router.post("/contacto", enviarContacto);
export default router;