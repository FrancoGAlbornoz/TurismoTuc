import express from "express";
import { 
    getExcursionesActivasBot,
    getExcursionPorIdBot, 
    getFechasDisponiblesBot, 
} from "../controllers/bot.controller.js";

const router = express.Router();

// =================================================
// Rutas de Excursiones
// =================================================
router.get("/excursiones/activas", getExcursionesActivasBot);
router.get("/excursiones/:id", getExcursionPorIdBot);
router.get("/excursiones/:id/fechas", getFechasDisponiblesBot);

export default router;