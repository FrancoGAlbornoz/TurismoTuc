const router = express.Router();
import express from "express";
import { registerTurista } from "../controllers/authturistas.controller.js";

router.post("/register", registerTurista);


export default router;
