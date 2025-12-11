// Limpia el mensaje: espacios, saltos de línea, minúsculas
export function cleanMessage(msg) {
  if (!msg) return "";
  return msg
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// Valida que el mensaje tenga contenido
export function isValidMessage(msg) {
  return msg && msg.trim().length > 0;
}

// Detecta palabras clave y números de menú
export function detectKeyword(msg, keywords = []) {
  const cleaned = cleanMessage(msg);

  // Primero, verificar si es un número de menú
  if (/^\d+$/.test(cleaned)) {
    return { type: "number", value: parseInt(cleaned) };
  }

  // Verificar si contiene alguna palabra clave
  for (const word of keywords) {
    if (cleaned.includes(word.toLowerCase())) {
      return { type: "keyword", value: word };
    }
  }

  // No se detectó nada
  return { type: "none" };
}

