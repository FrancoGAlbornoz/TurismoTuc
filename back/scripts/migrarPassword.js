import bcrypt from 'bcrypt';
import { pool } from "../config/DB.js";
 // tu conexión MySQL

const migrarPasswords = async () => {
  try {
    const [usuarios] = await pool.promise().query(
      "SELECT id_usuario, password FROM Usuarios WHERE password NOT LIKE '$2b$%'"
    );

    for (const usuario of usuarios) {
      const { id_usuario, password } = usuario;

      // Hashear la contraseña en texto plano
      const hashed = await bcrypt.hash(password, 10);

      // Actualizar en la base
      await pool.promise().query(
        "UPDATE Usuarios SET password = ? WHERE id_usuario = ?",
        [hashed, id_usuario]
      );

      console.log(` Usuario ${id_usuario} migrado`);
    }

    console.log("Migración completada");
  } catch (error) {
    console.error(" Error en la migración:", error);
  }
};

migrarPasswords();
