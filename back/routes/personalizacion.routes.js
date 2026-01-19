
// routes/personalizacionRoutes.js
import express from "express";
import {
  getCategorias,
  createCategoria,
  getPreguntas,
  createPregunta,
  getPreguntasPorExcursion,
  addPreguntaAExcursion,
  getRespuestasPorReserva,
  addRespuestaPersonalizacion,
  deleteCategoria,
  guardarRespuestas,
  getTodasLasAsignaciones,
  deleteAsignacion
} from "../controllers/personalizacion.controller.js";

const router = express.Router();

// Categorías
router.get("/categorias", getCategorias);
router.post("/categorias", createCategoria);

// Preguntas
router.get("/preguntas", getPreguntas);
router.post("/preguntas", createPregunta);

// Asociación excursión ↔ preguntas
router.get("/excursion/:id_excursion", getPreguntasPorExcursion);
router.post("/excursion", addPreguntaAExcursion);

// Respuestas
router.get("/reserva/:id_reserva", getRespuestasPorReserva);
router.post("/reserva", addRespuestaPersonalizacion);
router.post("/respuestas", guardarRespuestas);

router.get("/asignaciones", getTodasLasAsignaciones);
router.put("/asignaciones/:id_excursion/:id_pregunta", deleteAsignacion);

// Ruta para eliminar categoría (marcar como eliminada)
router.put("/categorias/eliminar/:id", deleteCategoria);

export default router;
