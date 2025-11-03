// controllers/turistasController.js
import { pool } from "../config/DB.js";

// =============================
// TURISTAS
// =============================

// Listar todos los turistas activos
export const getTuristas = (req, res) => {
  const sql = `
    SELECT id_turista, nombre, apellido, dni, email, telefono, direccion, nacionalidad
    FROM Turistas
    WHERE eliminado = 0
    ORDER BY nombre ASC
  `;

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener turistas:", err);
      return res.status(500).json({ message: "Error al obtener turistas" });
    }
    res.json(results);
  });
};

// Obtener un turista por ID
export const getTuristaById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT id_turista, nombre, apellido, dni, email, telefono, direccion, nacionalidad
    FROM Turistas
    WHERE id_turista = ? AND eliminado = 0
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener turista:", err);
      return res.status(500).json({ message: "Error al obtener turista" });
    }
    if (results.length === 0)
      return res.status(404).json({ message: "Turista no encontrado" });
    res.json(results[0]);
  });
};

// Crear un nuevo turista
export const createTurista = (req, res) => {
  const { nombre, apellido, dni, email, telefono, direccion, nacionalidad } = req.body;

  if (!nombre || !apellido || !dni)
    return res.status(400).json({ message: "Faltan datos obligatorios (nombre, apellido o DNI)" });

  const sql = `
    INSERT INTO Turistas (nombre, apellido, dni, email, telefono, direccion, nacionalidad)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nombre, apellido, dni, email, telefono, direccion, nacionalidad];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al crear turista:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "El DNI ingresado ya existe" });
      }
      return res.status(500).json({ message: "Error al crear turista" });
    }
    res.status(201).json({ message: "Turista agregado correctamente", id: result.insertId });
  });
};

// Modificar un turista existente
export const updateTurista = (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, email, telefono, direccion, nacionalidad } = req.body;

  const sql = `
    UPDATE Turistas
    SET nombre=?, apellido=?, dni=?, email=?, telefono=?, direccion=?, nacionalidad=?
    WHERE id_turista=? AND eliminado=0
  `;
  const values = [nombre, apellido, dni, email, telefono, direccion, nacionalidad, id];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al actualizar turista:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "El DNI ingresado ya existe" });
      }
      return res.status(500).json({ message: "Error al actualizar turista" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Turista no encontrado" });
    res.json({ message: "Turista actualizado correctamente" });
  });
};

// Baja lógica
export const deleteTurista = (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE Turistas
    SET eliminado=1, fecha_eliminacion=NOW()
    WHERE id_turista=?
  `;
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar turista:", err);
      return res.status(500).json({ message: "Error al eliminar turista" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Turista no encontrado" });
    res.json({ message: "Turista eliminado (baja lógica) correctamente" });
  });
};

// =============================
// RESERVAS DE UN TURISTA
// =============================
export const getReservasByTurista = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      r.id_reserva,
      e.titulo AS excursion,
      e.ubicacion,
      r.cantidad_personas,
      r.monto_total,
      r.estado_reserva,
      r.fecha_reserva,
      DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha_salida,
      f.hora_salida
    FROM Reservas r
    JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    WHERE r.id_turista = ? 
      AND r.eliminado = 0
    ORDER BY r.fecha_reserva DESC;
  `;

  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener reservas del turista:", err.sqlMessage);
      return res.status(500).json({ message: "Error al obtener reservas del turista", error: err.sqlMessage });
    }
    res.json(results);
  });
};
