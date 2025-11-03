import { pool } from "../config/DB.js";

// =============================
// EXCURSIONES
// =============================

// Obtener todas las excursiones con sus categorías
export const getExcursiones = (req, res) => {
  const { ubicacion, precio_min, precio_max, duracion, estado, q } = req.query;

  let sql = `
    SELECT e.id_excursion, e.titulo, e.descripcion, e.precio_base, e.duracion,
           e.ubicacion, e.incluye, e.politicas, e.estado, e.fecha_creacion,
           c.id_categoria_excursion, c.nombre_categoria
    FROM Excursiones e
    LEFT JOIN ExcursionCategorias ec ON e.id_excursion = ec.id_excursion
    LEFT JOIN CategoriasExcursion c ON ec.id_categoria_excursion = c.id_categoria_excursion
    WHERE e.eliminado = 0
  `;
  const values = [];

  if (q) {
    sql += " AND (e.titulo LIKE ? OR e.ubicacion LIKE ?)";
    values.push(`%${q}%`, `%${q}%`);
  }

  if (ubicacion) {
    sql += " AND e.ubicacion LIKE ?";
    values.push(`%${ubicacion}%`);
  }

  if (duracion) {
    sql += " AND e.duracion LIKE ?";
    values.push(`%${duracion}%`);
  }

  if (precio_min) {
    sql += " AND e.precio_base >= ?";
    values.push(precio_min);
  }

  if (precio_max) {
    sql += " AND e.precio_base <= ?";
    values.push(precio_max);
  }

  if (estado) {
    sql += " AND e.estado = ?";
    values.push(estado);
  }

  sql += " ORDER BY e.fecha_creacion DESC";

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error al obtener excursiones:", err);
      return res.status(500).json({ message: "Error al obtener excursiones" });
    }

    const agrupadas = {};
    results.forEach((row) => {
      if (!agrupadas[row.id_excursion]) {
        agrupadas[row.id_excursion] = {
          id_excursion: row.id_excursion,
          titulo: row.titulo,
          descripcion: row.descripcion,
          precio_base: row.precio_base,
          duracion: row.duracion,
          ubicacion: row.ubicacion,
          incluye: row.incluye,
          politicas: row.politicas,
          estado: row.estado,
          fecha_creacion: row.fecha_creacion,
          categorias: [],
        };
      }
      if (row.id_categoria_excursion && row.nombre_categoria) {
        agrupadas[row.id_excursion].categorias.push({
          id_categoria_excursion: row.id_categoria_excursion,
          nombre_categoria: row.nombre_categoria,
        });
      }
    });

    res.json(Object.values(agrupadas));
  });
};

// Obtener una excursión por ID con sus categorías
export const getExcursionById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT e.id_excursion, e.titulo, e.descripcion, e.precio_base, e.duracion,
           e.ubicacion, e.incluye, e.politicas, e.estado, e.fecha_creacion,
           c.id_categoria_excursion, c.nombre_categoria
    FROM Excursiones e
    LEFT JOIN ExcursionCategorias ec ON e.id_excursion = ec.id_excursion
    LEFT JOIN CategoriasExcursion c ON ec.id_categoria_excursion = c.id_categoria_excursion
    WHERE e.id_excursion = ? AND e.eliminado = 0
  `;

  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener excursión:", err);
      return res.status(500).json({ message: "Error al obtener excursión" });
    }
    if (results.length === 0)
      return res.status(404).json({ message: "Excursión no encontrada" });

    const base = {
      id_excursion: results[0].id_excursion,
      titulo: results[0].titulo,
      descripcion: results[0].descripcion,
      precio_base: results[0].precio_base,
      duracion: results[0].duracion,
      ubicacion: results[0].ubicacion,
      incluye: results[0].incluye,
      politicas: results[0].politicas,
      estado: results[0].estado,
      fecha_creacion: results[0].fecha_creacion,
      categorias: [],
    };

    results.forEach((row) => {
      if (row.id_categoria_excursion && row.nombre_categoria) {
        base.categorias.push({
          id_categoria_excursion: row.id_categoria_excursion,
          nombre_categoria: row.nombre_categoria,
        });
      }
    });

    res.json(base);
  });
};

// Crear una nueva excursión con categoría
export const createExcursion = (req, res) => {
  const { titulo, descripcion, precio_base, duracion, ubicacion, incluye, politicas, id_categoria_excursion } = req.body;

  if (!titulo || !precio_base)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  const sql = `INSERT INTO Excursiones 
              (titulo, descripcion, precio_base, duracion, ubicacion, incluye, politicas)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [titulo, descripcion, precio_base, duracion, ubicacion, incluye, politicas];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al crear excursión:", err);
      return res.status(500).json({ message: "Error al crear excursión" });
    }

    const id_excursion = result.insertId;

    if (id_categoria_excursion) {
      const sqlCat = `INSERT INTO ExcursionCategorias (id_excursion, id_categoria_excursion) VALUES (?, ?)`;
      pool.query(sqlCat, [id_excursion, id_categoria_excursion], (err2) => {
        if (err2) {
          console.error("Error al vincular categoría:", err2);
          return res.status(500).json({ message: "Excursión creada pero no se pudo vincular categoría" });
        }
        res.status(201).json({ message: "Excursión creada correctamente", id: id_excursion });
      });
    } else {
      res.status(201).json({ message: "Excursión creada correctamente", id: id_excursion });
    }
  });
};

// Actualizar una excursión existente
export const updateExcursion = (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, precio_base, duracion, ubicacion, incluye, politicas, estado } = req.body;

  const sql = `UPDATE Excursiones
               SET titulo=?, descripcion=?, precio_base=?, duracion=?, ubicacion=?, 
                   incluye=?, politicas=?, estado=?
               WHERE id_excursion=? AND eliminado=0`;

  const values = [titulo, descripcion, precio_base, duracion, ubicacion, incluye, politicas, estado, id];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al actualizar excursión:", err);
      return res.status(500).json({ message: "Error al actualizar excursión" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Excursión no encontrada" });
    res.json({ message: "Excursión actualizada correctamente" });
  });
};

// Eliminar (baja lógica) una excursión
export const deleteExcursion = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE Excursiones
               SET eliminado=1, fecha_eliminacion=NOW()
               WHERE id_excursion=?`;

  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar excursión:", err);
      return res.status(500).json({ message: "Error al eliminar excursión" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Excursión no encontrada" });
    res.json({ message: "Excursión eliminada (baja lógica) correctamente" });
  });
};
export const updateCategoriaExcursion = (req, res) => {
  const { id_excursion, id_categoria_excursion } = req.body;

  if (!id_excursion || !id_categoria_excursion)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  // 1. Eliminar todas las categorías actuales
  const deleteSql = `DELETE FROM ExcursionCategorias WHERE id_excursion = ?`;

  pool.query(deleteSql, [id_excursion], (err) => {
    if (err) {
      console.error("Error al eliminar categorías anteriores:", err);
      return res.status(500).json({ message: "Error al limpiar categorías anteriores" });
    }

    // 2. Insertar la nueva categoría
    const insertSql = `INSERT INTO ExcursionCategorias (id_excursion, id_categoria_excursion) VALUES (?, ?)`;

    pool.query(insertSql, [id_excursion, id_categoria_excursion], (err2) => {
      if (err2) {
        console.error("Error al insertar nueva categoría:", err2);
        return res.status(500).json({ message: "Error al actualizar categoría" });
      }

      res.json({ message: "Categoría actualizada correctamente" });
    });
  });
};

export const getCategoriasExcursion = (req, res) => {
  const sql = `SELECT id_categoria_excursion, nombre_categoria FROM CategoriasExcursion`;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener categorías:", err);
      return res.status(500).json({ message: "Error al obtener categorías" });
    }
    res.json(results);
  });
};

// =============================
// FECHAS DE EXCURSIÓN
// =============================

// Obtener todas las fechas para una excursión específica
export const getFechasByExcursion = (req, res) => {
  const { id_excursion } = req.params;

  const sql = `SELECT id_fecha, fecha, hora_salida, cupo_maximo, cupo_disponible, estado
               FROM FechasExcursion
               WHERE id_excursion = ? AND eliminado = 0
               ORDER BY fecha ASC`;

  pool.query(sql, [id_excursion], (err, results) => {
    if (err) {
      console.error("Error al obtener fechas de excursión:", err);
      return res.status(500).json({ message: "Error al obtener fechas" });
    }
    res.json(results);
  });
};

// Crear una nueva fecha para una excursión
export const createFechaExcursion = (req, res) => {
  const { id_excursion, fecha, hora_salida, cupo_maximo } = req.body;

  if (!id_excursion || !fecha || !cupo_maximo)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  const sql = `INSERT INTO FechasExcursion 
               (id_excursion, fecha, hora_salida, cupo_maximo, cupo_disponible)
               VALUES (?, ?, ?, ?, ?)`;
  const values = [id_excursion, fecha, hora_salida, cupo_maximo, cupo_maximo];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al crear fecha:", err);
      return res.status(500).json({ message: "Error al crear fecha" });
    }
    res.status(201).json({ message: "Fecha agregada correctamente", id: result.insertId });
  });
};

// Actualizar una fecha de excursión
export const updateFechaExcursion = (req, res) => {
  const { id } = req.params;
  const { fecha, hora_salida, cupo_maximo, cupo_disponible, estado } = req.body;

  if (!fecha && !hora_salida && !cupo_maximo && !cupo_disponible && !estado)
    return res.status(400).json({ message: "No se enviaron datos para actualizar" });

  const fields = [];
  const values = [];

  if (fecha) {
    fields.push("fecha = ?");
    values.push(fecha);
  }
  if (hora_salida) {
    fields.push("hora_salida = ?");
    values.push(hora_salida);
  }
  if (cupo_maximo) {
    fields.push("cupo_maximo = ?");
    values.push(cupo_maximo);
  }
  if (cupo_disponible) {
    fields.push("cupo_disponible = ?");
    values.push(cupo_disponible);
  }
  if (estado) {
    fields.push("estado = ?");
    values.push(estado);
  }

  const sql = `UPDATE FechasExcursion SET ${fields.join(", ")} WHERE id_fecha = ? AND eliminado = 0`;
  values.push(id);

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al actualizar fecha de excursión:", err);
      return res.status(500).json({ message: "Error al actualizar fecha" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Fecha no encontrada" });

    res.json({ message: "Fecha de excursión actualizada correctamente" });
  });
};

// Eliminar (baja lógica) una fecha de excursión
export const deleteFechaExcursion = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE FechasExcursion
               SET eliminado=1, fecha_eliminacion=NOW()
               WHERE id_fecha=?`;

  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar fecha:", err);
      return res.status(500).json({ message: "Error al eliminar fecha" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Fecha no encontrada" });
    res.json({ message: "Fecha eliminada (baja lógica) correctamente" });
  });
};