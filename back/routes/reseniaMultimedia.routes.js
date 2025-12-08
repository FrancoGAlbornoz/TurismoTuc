import express from "express";
import { uploadExcursionImage } from "../config/uploadExcursiones.js";
import {
  uploadImagenResena,
  getPendientesMultimedia,
  aprobarMultimedia,
  rechazarMultimedia,
  getMultimediaByResena,
  eliminarMultimedia,
} from "../controllers/reseniaMultimedia.controller.js";

const router = express.Router();

// -------------------------------------------------------------------
// Turista: subir imagen para una reseña
// POST /api/resenas/:id/imagen
// -------------------------------------------------------------------
router.post(
  "/resenas/:id/imagen",
  uploadExcursionImage.single("imagen"), // campo "imagen" en el form-data
  uploadImagenResena
);

// -------------------------------------------------------------------
// Admin: listar multimedia pendiente de moderación
// GET /api/multimedia/pendientes
// -------------------------------------------------------------------
router.get("/multimedia/pendientes", getPendientesMultimedia);

// -------------------------------------------------------------------
// Admin: aprobar multimedia
// PUT /api/multimedia/:id/aprobar
// -------------------------------------------------------------------
router.put("/multimedia/:id/aprobar", aprobarMultimedia);

// -------------------------------------------------------------------
// Admin: rechazar multimedia
// PUT /api/multimedia/:id/rechazar
// -------------------------------------------------------------------
router.put("/multimedia/:id/rechazar", rechazarMultimedia);

// -------------------------------------------------------------------
// Admin: eliminar multimedia (borrado lógico)
// PUT /api/multimedia/:id/eliminar
// -------------------------------------------------------------------
router.put("/multimedia/:id/eliminar", eliminarMultimedia);

// -------------------------------------------------------------------
// Público / front: obtener multimedia de una reseña
// GET /api/resenas/:id/multimedia?soloAprobadas=true
// -------------------------------------------------------------------
router.get("/resenas/:id/multimedia", getMultimediaByResena);

export default router;
