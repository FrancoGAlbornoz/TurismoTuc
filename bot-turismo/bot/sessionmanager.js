// bot/sessionManager.js

// Almacén en memoria de las sesiones de usuario
const sessions = {};

/**
 * Obtiene la sesión de un usuario (o crea una nueva)
 */
export function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      step: "start",          // Paso actual en el flujo
      excursionSeleccionada: null,  // ID de excursión elegida
      datos: {}               // Datos adicionales
    };
  }
  return sessions[userId];
}

/**
 * Actualiza el step de la sesión
 */
export function setStep(userId, step) {
  const session = getSession(userId);
  session.step = step;
}

/**
 * Guarda la excursión seleccionada
 */
export function setExcursionSeleccionada(userId, idExcursion) {
  const session = getSession(userId);
  session.excursionSeleccionada = idExcursion;
}

/**
 * Obtiene la excursión seleccionada
 */
export function getExcursionSeleccionada(userId) {
  const session = getSession(userId);
  return session.excursionSeleccionada;
}

/**
 * Reinicia la sesión del usuario
 */
export function resetSession(userId) {
  sessions[userId] = {
    step: "start",
    excursionSeleccionada: null,
    datos: {}
  };
}

/**
 * Elimina la sesión de un usuario
 */
export function deleteSession(userId) {
  delete sessions[userId];
}

/**
 * Obtiene todas las sesiones activas (para debugging)
 */
export function getAllSessions() {
  return sessions;
}