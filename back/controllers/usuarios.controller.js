import { pool } from "../config/DB.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// =========================
// R O L E S
// =========================
export const getRoles = (req, res) => {
  pool.query("SELECT * FROM Roles WHERE eliminado = 0", (err, results) => {
    if (err) return res.status(500).json({ message: "Error al obtener roles" });
    res.json(results);
  });
};

// =========================
// USUARIOS
// =========================
export const getUsuarios = (req, res) => {
  const { status = "active" } = req.query; // active | deleted | all

  let where = "u.eliminado = 0";
  if (status === "deleted") where = "u.eliminado = 1";
  if (status === "all") where = "1=1";

  pool.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono,
            r.nombre_rol, u.estado, u.eliminado, u.fecha_eliminacion
     FROM Usuarios u
     JOIN Roles r ON u.id_rol = r.id_rol
     WHERE ${where}
     ORDER BY u.id_usuario DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error al obtener usuarios" });
      res.json(results);
    }
  );
};
export const getUsuarioById = (req, res) => {
  const { id } = req.params;
  pool.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, r.nombre_rol, u.estado
     FROM Usuarios u
     JOIN Roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ? AND u.eliminado = 0`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error al buscar usuario" });
      if (results.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(results[0]);
    }
  );
};

export const createUsuario = async (req, res) => {
  const { nombre, apellido, email, password, telefono, id_rol } = req.body;
  if (!nombre || !apellido || !email || !password || !id_rol)
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO Usuarios (nombre, apellido, email, password, telefono, id_rol) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [nombre, apellido, email, hashedPassword, telefono, id_rol];
  pool.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ message: "Error al crear usuario" });
      res.status(201).json({ message: "Usuario creado exitosamente", id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: "Error al hashear contraseña" });
  }
  
};

export const updateUsuario = (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, telefono, id_rol, estado } = req.body;

  const sql = `UPDATE Usuarios
               SET nombre=?, apellido=?, email=?, telefono=?, id_rol=?, estado=?
               WHERE id_usuario=? AND eliminado=0`;
  const values = [nombre, apellido, email, telefono, id_rol, estado, id];

  pool.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Error al actualizar usuario" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado correctamente" });
  });
};

export const deleteUsuario = (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE Usuarios SET eliminado=1, fecha_eliminacion=NOW() WHERE id_usuario=?`;

  pool.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error al eliminar usuario" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  });
};


// =========================
// RECUPERAR CONTRASEÑA
// =========================
export const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requerido" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiration = new Date(Date.now() + 60 * 60 * 1000);

  pool.query("SELECT id_turista FROM Turistas WHERE email=? AND eliminado=0", [email], (err, tResults) => {
    if (err) return res.status(500).json({ message: "Error interno" });

    if (tResults.length > 0) {
      const id = tResults[0].id_turista;
      pool.query("UPDATE Turistas SET reset_token=?, reset_token_expiration=? WHERE id_turista=?", [token, expiration, id], (err2) => {
        if (err2) return res.status(500).json({ message: "Error al guardar token" });
        enviarCorreo(email, token);
        return res.json({ message: "Correo de recuperación enviado" });
      });
    } else {
      pool.query("SELECT id_usuario FROM Usuarios WHERE email=? AND eliminado=0", [email], (err3, uResults) => {
        if (err3) return res.status(500).json({ message: "Error interno" });
        if (uResults.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

        const id = uResults[0].id_usuario;
        pool.query("UPDATE Usuarios SET reset_token=?, reset_token_expiration=? WHERE id_usuario=?", [token, expiration, id], (err4) => {
          if (err4) return res.status(500).json({ message: "Error al guardar token" });
          enviarCorreo(email, token);
          return res.json({ message: "Correo de recuperación enviado" });
        });
      });
    }
  });
};

function enviarCorreo(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.sendMail({
    from: `"MAAVYT Soporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Recuperación de contraseña",
    text: `Hola, usá este enlace para cambiar tu contraseña:\n\n${resetLink}\n\nEste enlace expira en 1 hora.`,
  });
}

// =========================
// RESET PASSWORD
// =========================
export const resetPassword = (req, res) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  pool.query(
    "SELECT id_turista, reset_token_expiration FROM Turistas WHERE reset_token=? AND eliminado=0",
    [token],
    async(err, tResults) => {
      if (err) return res.status(500).json({ message: "Error interno" });

      if (tResults.length > 0) {
        const { id_turista, reset_token_expiration } = tResults[0];
        if (new Date() > reset_token_expiration) {
          return res.status(400).json({ message: "Token expirado" });
        }
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        // Actualizar contraseña en Turistas
        pool.query(
          "UPDATE Turistas SET password=?, reset_token=NULL, reset_token_expiration=NULL WHERE id_turista=?",
          [hashedPassword, id_turista],
          (err2) => {
            if (err2) return res.status(500).json({ message: "Error al actualizar contraseña" });
            return res.json({ message: "Contraseña actualizada correctamente" });
          }
        );
      } else {
        pool.query(
          "SELECT id_usuario, reset_token_expiration FROM Usuarios WHERE reset_token=? AND eliminado=0",
          [token],
          async (err3, uResults) => {
            if (err3) return res.status(500).json({ message: "Error interno" });
            if (uResults.length === 0) {
              return res.status(404).json({ message: "Token inválido" });
            }

            const { id_usuario, reset_token_expiration } = uResults[0];
            if (new Date() > reset_token_expiration) {
              return res.status(400).json({ message: "Token expirado" });
            }
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
            pool.query(
              "UPDATE Usuarios SET password=?, reset_token=NULL, reset_token_expiration=NULL WHERE id_usuario=?",
              [hashedPassword, id_usuario],
              (err4) => {
                if (err4) return res.status(500).json({ message: "Error al actualizar contraseña" });
                return res.json({ message: "Contraseña actualizada correctamente" });
              }
            );
          }
        );
      }
    }
  );
};


export const restoreUsuario = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE Usuarios
               SET eliminado=0, fecha_eliminacion=NULL
               WHERE id_usuario=?`;

  pool.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error al restaurar usuario" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario restaurado correctamente" });
  });
};