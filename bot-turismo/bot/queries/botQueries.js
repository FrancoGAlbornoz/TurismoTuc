import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.API_URL;
/**
 *Obtiene todas las excursiones activas llamando al endpoint del BACKEND
 */
export async function getExcursionesActivas() {
  try {
    const response = await axios.get(`${API_URL}/excursiones/activas`);
    return response.data;
  } catch (err) {
    console.error("❌ Error al obtener excursiones desde la API:", err.message);
    return [];
  }
}
/**
 * Obtiene la información de una excursión por ID
 * (Utiliza el endpoint existente que ahora está en /api/bot)
 */
export async function getExcursionPorId(idExcursion) {
  try {
    const response = await axios.get(`${API_URL}/excursiones/${idExcursion}`);
    return response.data;
  } catch (err) {
    console.error(
      "❌ Error al obtener excursión por ID desde la API:",
      err.message
    );
    return null;
  }
}
/**
 * Obtiene el precio de una excursión
 * (Utiliza getExcursionPorId para obtener los datos)
 */
export async function getPrecioExcursion(idExcursion) {
  // Rehusamos la función que llama a la API
  const excursion = await getExcursionPorId(idExcursion);

  if (!excursion) return null;

  // Mantenemos la estructura de respuesta que tu bot espera
  return {
    titulo: excursion.titulo,
    precio_base: excursion.precio_base,
    duracion: excursion.duracion,
    incluye: excursion.incluye,
  };
}

/**
 * Obtiene fechas disponibles de una excursión
 * (Llama al endpoint que devuelve las fechas y completa con info de excursión)
 */
export async function getFechasDisponibles(idExcursion) {
  try {
    const response = await axios.get(
      `${API_URL}/excursiones/${idExcursion}/fechas`
    );
    return response.data;
  } catch (err) {
    console.error("❌ Error al obtener fechas desde la API:", err.message);
    return [];
  }
}