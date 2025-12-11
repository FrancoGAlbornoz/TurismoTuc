// bot/cleanSession.js
import fs from "fs";
import path from "path";

// Ruta a la carpeta de la sesión de WhatsApp
const sessionPath = path.resolve(".wwebjs_auth", "session-bot-turismo2", "Default");

export function cleanSession() {
  if (!fs.existsSync(sessionPath)) return;

  const files = fs.readdirSync(sessionPath);
  files.forEach(file => {
    const filePath = path.join(sessionPath, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Archivo eliminado: ${file}`);
    } catch (err) {
      console.warn(`⚠️ No se pudo eliminar ${file}:`, err.message);
    }
  });
  console.log("🧹 Carpeta de sesión limpiada.");
}
