import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { initWhatsAppBot } from "./bot/whatsapp.js";

const app = express();
const client = initWhatsAppBot();

const BOT_WEB_PORT = process.env.BOT_WEB_PORT || 4000;

app.get("/", (req, res) => {
  res.send("🤖 Bot de Turismo Tucumán activo!");
});

const server = app.listen(BOT_WEB_PORT, () => {
  console.log(`🌐 Servidor corriendo en http://localhost:${BOT_WEB_PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando bot y servidor...");
  try {
    await client.destroy();
  } catch (error) {
    console.log("⚠️ Error al cerrar (ignorado)");
  }
  server.close(() => console.log("✅ Servidor cerrado"));
  process.exit(0);
});