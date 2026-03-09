import { pool } from "../config/DB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ============================
// 🔐 REGISTRO DE TURISTA
// ============================
export const registerTurista = async (req, res) => {
  const { nombre, apellido, dni, email, telefono, direccion, nacionalidad, password } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !apellido || !dni || !email || !password || !telefono || !direccion || !nacionalidad) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Verificar si el email ya está registrado
    const [existe] = await pool.promise().query("SELECT id_turista FROM Turistas WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo turista
    const sql = `
      INSERT INTO Turistas (nombre, apellido, dni, email, password, telefono, direccion, nacionalidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [nombre, apellido, dni, email, hashedPassword, telefono, direccion, nacionalidad];
    await pool.promise().query(sql, values);

    res.status(201).json({ message: "Turista registrado correctamente." });
  } catch (err) {
    console.error("Error al registrar turista:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
