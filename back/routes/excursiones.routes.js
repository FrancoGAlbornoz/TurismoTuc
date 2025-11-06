import express from "express";
import {
  getExcursiones,
  getExcursionById,
  createExcursion,
  updateExcursion,
  deleteExcursion,
  getMultimediaByExcursion,
  createMultimedia,
  deleteMultimedia,
  getFechasByExcursion,
  getExcursionesConFechas,
  createFechaExcursion,
  updateFechaExcursion,
  deleteFechaExcursion,
  getGuias,
  getExcursionesPorGuia,
  getParticipantesByExcursion,
  getFechaById,
} from "../controllers/excursiones.controller.js";

const router = express.Router();

// =============================
// Rutas de Excursiones
// =============================

// 🔹 Rutas específicas primero
router.get("/guias", getGuias);

// ✅ Esta ruta debe ir antes que cualquier "/:id"
router.get("/:id/participantes", getParticipantesByExcursion);
router.get("/con-fechas", getExcursionesConFechas);
router.get("/fechas/:id", getFechaById);


// 🔹 Rutas dinámicas
router.get("/", getExcursiones);
router.post("/", createExcursion);
router.put("/:id", updateExcursion);
router.delete("/:id", deleteExcursion);
router.get("/:id", getExcursionById);
router.get("/guia/:id_guia", getExcursionesPorGuia);

// =============================
// MULTIMEDIA
// =============================
router.get("/:id_excursion/multimedia", getMultimediaByExcursion);
router.post("/multimedia", createMultimedia);
router.delete("/multimedia/:id", deleteMultimedia);

// =============================
// Fechas de Excursión
// =============================
router.get("/:id_excursion/fechas", getFechasByExcursion);
router.post("/fechas-excursion", createFechaExcursion);
router.put("/fechas/:id", updateFechaExcursion);
router.delete("/fechas/:id", deleteFechaExcursion);

export default router;