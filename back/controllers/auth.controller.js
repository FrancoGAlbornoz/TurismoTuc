import { pool } from "../config/DB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUnificado = async (req, res) => {
  const { email, password } = req.body;

  // ESPÍA 1: Ver qué datos llegan desde React
  console.log("1. Intento de login. Email recibido:", email, "- Password ingresada:", password);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos obligatorios",
    });
  }

  try {
    // 1) Buscar primero en Usuarios (personal interno)
    const [usuarios] = await pool.promise().query(
      `SELECT 
          u.id_usuario,
          u.nombre,
          u.apellido,
          u.email,
          u.password,
          u.estado,
          r.nombre_rol
        FROM Usuarios u
        JOIN Roles r ON u.id_rol = r.id_rol
        WHERE u.email = ? 
          AND u.eliminado = 0
          AND u.estado = 'activo'
        LIMIT 1`,
      [email]
    );

    // ESPÍA 2
    console.log("2. ¿Lo encontró en la tabla Usuarios?:", usuarios.length > 0);

    if (usuarios.length > 0) {
      const user = usuarios[0];

      const validPassword = await bcrypt.compare(password, user.password);
      
      // ESPÍA 3
      console.log("3. ¿Contraseña de Usuario coincide con bcrypt?:", validPassword);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Contraseña incorrecta",
        });
      }

      // AGREGADO: Generamos el token para el Usuario (antes faltaba)
      const token = jwt.sign(
        { id: user.id_usuario, email: user.email, rol: user.nombre_rol, tipo: "usuario" },
        process.env.JWT_SECRET || "clave_supersecreta",
        { expiresIn: "2h" }
      );

      return res.json({
        success: true,
        tipo: "usuario",
        token, // Ahora sí enviamos el token
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.nombre_rol,
        },
      });
    }

    // 2) Si no existe en Usuarios, buscar en Turistas
    const [turistas] = await pool.promise().query(
      `SELECT 
          id_turista,
          nombre,
          apellido,
          dni,
          email,
          telefono,
          direccion,
          nacionalidad,
          password
        FROM Turistas
        WHERE email = ?
          AND eliminado = 0
        LIMIT 1`,
      [email]
    );

    // ESPÍA 4
    console.log("4. ¿Lo encontró en la tabla Turistas?:", turistas.length > 0);

    if (turistas.length > 0) {
      const turista = turistas[0];

      const validPassword = await bcrypt.compare(password, turista.password);
      
      // ESPÍA 5
      console.log("5. ¿Contraseña de Turista coincide con bcrypt?:", validPassword);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Contraseña incorrecta",
        });
      }

      const token = jwt.sign(
        { id: turista.id_turista, email: turista.email, tipo: "turista" },
        process.env.JWT_SECRET || "clave_supersecreta",
        { expiresIn: "2h" }
      );

      return res.json({
        success: true,
        tipo: "turista",
        token,
        turista: {
          id_turista: turista.id_turista,
          nombre: turista.nombre,
          apellido: turista.apellido,
          dni: turista.dni,
          email: turista.email,
          telefono: turista.telefono,
          direccion: turista.direccion,
          nacionalidad: turista.nacionalidad,
        },
      });
    }

    // ESPÍA 6
    console.log("6. El correo no existe en ninguna de las dos tablas.");
    return res.status(401).json({
      success: false,
      message: "Usuario no encontrado",
    });
  } catch (error) {
    console.error("Error en login unificado:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};