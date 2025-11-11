import express from "express";
import {
  getRoles,
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  forgotPassword,     // ✅ nuevo
  resetPassword       // ✅ nuevo
} from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/roles", getRoles);
router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

// 🔹 Endpoint de login
router.post("/login", loginUsuario);

// 🔹 Endpoints de recuperación de contraseña
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;