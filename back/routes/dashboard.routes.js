import express from "express";
import {
  getMetricas,
  getReservasPendientes,
  getReservasProximas,
  getReservasPorMes,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/metricas", getMetricas);
router.get("/reservas/pendientes", getReservasPendientes);
router.get("/reservas/proximas", getReservasProximas);
router.get("/reservas/mes/:anio/:mes", getReservasPorMes);

export default router;
