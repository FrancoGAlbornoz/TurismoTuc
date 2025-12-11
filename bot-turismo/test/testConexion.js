// testExcursiones.js
import dotenv from "dotenv";
dotenv.config();

import { pool } from "../bot/db.js"; // asegúrate que db.js exporte pool correctamente

// Función para traer excursiones activas
export async function getExcursiones() {
  try {
    const [rows] = await pool.query(`
      SELECT titulo, descripcion, ubicacion
      FROM Excursiones
      WHERE estado = 'activa' AND eliminado = 0
    `);
    return rows;
  } catch (err) {
    console.error("Error al consultar excursiones:", err.message);
    return [];
  }
}

// Función de prueba
async function test() {
  const excursiones = await getExcursiones();
  if (!excursiones.length) {
    console.log("No hay excursiones disponibles actualmente.");
    return;
  }

  console.log("Excursiones disponibles:");
  excursiones.forEach(e => {
    console.log(`- ${e.titulo}: ${e.descripcion} (Ubicación: ${e.ubicacion})`);
  });
}

test();
