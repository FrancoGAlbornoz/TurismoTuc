// controllers/personalizacionController.js
import { pool } from "../config/DB.js";

// =============================
// CATEGORÍAS
// =============================

export const getCategorias = (req, res) => {
  const sql = `
    SELECT id_categoria, nombre_categoria
    FROM CategoriasPersonalizacion
    WHERE eliminado = 0
    ORDER BY id_categoria ASC
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener categorías:", err);
      return res.status(500).json({ message: "Error al obtener categorías" });
    }
    res.json(results);
  });
};

export const createCategoria = (req, res) => {
  const { nombre_categoria } = req.body;
  if (!nombre_categoria)
    return res.status(400).json({ message: "Falta el nombre de la categoría" });

  pool.query(
    `INSERT INTO CategoriasPersonalizacion (nombre_categoria) VALUES (?)`,
    [nombre_categoria],
    (err, result) => {
      if (err) {
        console.error("Error al crear categoría:", err);
        return res.status(500).json({ message: "Error al crear categoría" });
      }
      res.status(201).json({ message: "Categoría creada correctamente", id: result.insertId });
    }
  );
};

// =============================
// ELIMINAR CATEGORÍA (soft delete)
// =============================
export const deleteCategoria = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE CategoriasPersonalizacion
    SET eliminado = 1, fecha_eliminacion = NOW()
    WHERE id_categoria = ?
  `;

  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar categoría:", err);
      return res.status(500).json({ message: "Error al eliminar categoría" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada correctamente" });
  });
};


// =============================
// PREGUNTAS
// =============================

export const getPreguntas = (req, res) => {
  const sql = `
    SELECT p.id_pregunta, c.nombre_categoria, p.texto_pregunta, p.tipo_respuesta
    FROM PreguntasPersonalizacion p
    JOIN CategoriasPersonalizacion c ON p.id_categoria = c.id_categoria
    WHERE p.eliminado = 0
    ORDER BY c.id_categoria ASC
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener preguntas:", err);
      return res.status(500).json({ message: "Error al obtener preguntas" });
    }
    res.json(results);
  });
};

export const createPregunta = (req, res) => {
  const { id_categoria, texto_pregunta, tipo_respuesta } = req.body;

  if (!id_categoria || !texto_pregunta)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  const sql = `
    INSERT INTO PreguntasPersonalizacion (id_categoria, texto_pregunta, tipo_respuesta)
    VALUES (?, ?, ?)
  `;
  const values = [id_categoria, texto_pregunta, tipo_respuesta || "checkbox"];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al crear pregunta:", err);
      return res.status(500).json({ message: "Error al crear pregunta" });
    }
    res.status(201).json({ message: "Pregunta creada correctamente", id: result.insertId });
  });
};

// =============================
// ASOCIAR PREGUNTAS A EXCURSIÓN
// =============================

export const getPreguntasPorExcursion = (req, res) => {
  const { id_excursion } = req.params;
  const sql = `
    SELECT p.id_pregunta, p.texto_pregunta, p.tipo_respuesta
    FROM ExcursionPreguntas ep
    JOIN PreguntasPersonalizacion p ON ep.id_pregunta = p.id_pregunta
    WHERE ep.id_excursion = ? AND ep.eliminado = 0
  `;
  pool.query(sql, [id_excursion], (err, results) => {
    if (err) {
      console.error("Error al obtener preguntas de excursión:", err);
      return res.status(500).json({ message: "Error al obtener preguntas de excursión" });
    }
    res.json(results);
  });
};

export const addPreguntaAExcursion = (req, res) => {
  const { id_excursion, id_pregunta } = req.body;
  if (!id_excursion || !id_pregunta)
    return res.status(400).json({ message: "Faltan datos" });

  const sql = `
    INSERT INTO ExcursionPreguntas (id_excursion, id_pregunta)
    VALUES (?, ?)
  `;
  pool.query(sql, [id_excursion, id_pregunta], (err, result) => {
    if (err) {
      console.error("Error al asociar pregunta:", err);
      return res.status(500).json({ message: "Error al asociar pregunta" });
    }
    res.status(201).json({ message: "Pregunta asociada correctamente", id: result.insertId });
  });
};

// =============================
// RESPUESTAS DE PERSONALIZACIÓN
// =============================

export const getRespuestasPorReserva = (req, res) => {
  const { id_reserva } = req.params;
  const sql = `
    SELECT 
      rp.id_respuesta,
      p.texto_pregunta,
      rp.valor_respuesta
    FROM RespuestasPersonalizacion rp
    JOIN PreguntasPersonalizacion p ON rp.id_pregunta = p.id_pregunta
    WHERE rp.id_reserva = ? AND rp.eliminado = 0
  `;
  pool.query(sql, [id_reserva], (err, results) => {
    if (err) {
      console.error("Error al obtener respuestas:", err);
      return res.status(500).json({ message: "Error al obtener respuestas" });
    }
    res.json(results);
  });
};

export const addRespuestaPersonalizacion = (req, res) => {
  const { id_reserva, id_pregunta, valor_respuesta } = req.body;

  if (!id_reserva || !id_pregunta)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  const sql = `
    INSERT INTO RespuestasPersonalizacion (id_reserva, id_pregunta, valor_respuesta)
    VALUES (?, ?, ?)
  `;
  const values = [id_reserva, id_pregunta, valor_respuesta];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al guardar respuesta:", err);
      return res.status(500).json({ message: "Error al guardar respuesta" });
    }
    res.status(201).json({ message: "Respuesta registrada correctamente", id: result.insertId });
  });
};





// GUARDAR RESPUESTAS PERSONALIZADAS (Múltiples Reservas)
// ======================================
export const guardarRespuestas = (req, res) => {
  const { bloques } = req.body; // Recibe un array de bloques

  if (!bloques || !Array.isArray(bloques)) {
    return res.status(400).json({ message: "Formato de datos no válido" });
  }

  const values = [];
  bloques.forEach((bloque) => {
    bloque.respuestas.forEach((r) => {
      values.push([bloque.id_reserva, r.id_pregunta, r.valor_respuesta || ""]);
    });
  });

  if (values.length === 0) {
    return res.status(400).json({ message: "No hay respuestas para guardar" });
  }

  const sql = `INSERT INTO RespuestasPersonalizacion (id_reserva, id_pregunta, valor_respuesta) VALUES ?`;

  pool.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error al guardar respuestas:", err);
      return res.status(500).json({ message: "Error al guardar respuestas" });
    }
    res.json({ message: "Respuestas guardadas correctamente" });
  });
};