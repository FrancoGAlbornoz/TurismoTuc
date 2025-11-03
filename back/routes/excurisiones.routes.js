import express from "express";
import {
  getExcursiones,
  getExcursionById,
  createExcursion,
  updateExcursion,
  deleteExcursion,
  updateCategoriaExcursion,
  getCategoriasExcursion,
  getFechasByExcursion,
  createFechaExcursion,
  updateFechaExcursion,
  deleteFechaExcursion,
} from "../controllers/excursiones.controller.js";

const router = express.Router();

// =============================
// Rutas de Excursiones
// =============================

// 🔹 Primero las rutas específicas
router.get("/categorias-excursion", getCategoriasExcursion);
router.post("/categoria", updateCategoriaExcursion);

// 🔹 Luego las rutas dinámicas
router.get("/", getExcursiones);
router.post("/", createExcursion);
router.put("/:id", updateExcursion);
router.delete("/:id", deleteExcursion);
router.get("/:id", getExcursionById);

// =============================
// Rutas de Fechas de Excursión
// =============================
router.get("/:id_excursion/fechas", getFechasByExcursion);
router.post("/fechas-excursion", createFechaExcursion);
router.put("/fechas/:id", updateFechaExcursion);
router.delete("/fechas/:id", deleteFechaExcursion);

export default router;