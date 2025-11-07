import { pool } from "../config/DB.js";

// =============================
// CARRITO
// =============================

// Obtener carrito de un turista (solo el activo)
export const getCarritoByTurista = async (req, res) => {
  const { id_turista } = req.params;

  try {
    // 1️⃣ Buscar carrito activo
    const [results] = await pool.promise().query(`
      SELECT c.id_carrito, c.estado, c.fecha_creacion
      FROM Carrito c
      WHERE c.id_turista = ? AND c.eliminado = 0
      ORDER BY c.id_carrito DESC
      LIMIT 1
    `, [id_turista]);

    // 2️⃣ Si no hay, crear uno automáticamente
    if (results.length === 0) {
      console.log(`🛒 No había carrito para turista ${id_turista}, creando uno nuevo...`);
      const [insertResult] = await pool.promise().query(`
        INSERT INTO Carrito (id_turista, estado)
        VALUES (?, 'abierto')
      `, [id_turista]);

      return res.status(201).json({
        id_carrito: insertResult.insertId,
        estado: "abierto",
        fecha_creacion: new Date(),
        autoCreado: true
      });
    }

    // 3️⃣ Si sí hay, devolverlo
    res.json(results[0]);

  } catch (err) {
    console.error("❌ Error al obtener carrito:", err);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

// Crear nuevo carrito para un turista
export const createCarrito = (req, res) => {
  const { id_turista } = req.body;
  if (!id_turista)
    return res.status(400).json({ message: "Falta id_turista" });

  const sql = `
    INSERT INTO Carrito (id_turista, estado)
    VALUES (?, 'abierto')
  `;
  pool.query(sql, [id_turista], (err, result) => {
    if (err) {
      console.error("Error al crear carrito:", err);
      return res.status(500).json({ message: "Error al crear carrito" });
    }
    res.status(201).json({ message: "Carrito creado correctamente", id: result.insertId });
  });
};

// Agregar item al carrito
export const addItemCarrito = async (req, res) => {
  const { id_turista, id_fecha, cantidad_personas } = req.body;

  console.log("📩 addItemCarrito() recibido:", req.body);

  if (!id_turista || !id_fecha || !cantidad_personas) {
    console.warn("⚠️ Faltan datos obligatorios en la request");
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    // 1️⃣ Buscar carrito activo del turista
    const [carritoRes] = await pool.promise().query(
      "SELECT id_carrito FROM Carrito WHERE id_turista = ? AND eliminado = 0 ORDER BY id_carrito DESC LIMIT 1",
      [id_turista]
    );

    let id_carrito;
    if (carritoRes.length === 0) {
      console.log("🆕 No había carrito, creando uno nuevo...");
      const [newCarrito] = await pool.promise().query(
        "INSERT INTO Carrito (id_turista, estado) VALUES (?, 'abierto')",
        [id_turista]
      );
      id_carrito = newCarrito.insertId;
      console.log("✅ Nuevo carrito creado:", id_carrito);
    } else {
      id_carrito = carritoRes[0].id_carrito;
      console.log("🛒 Carrito existente:", id_carrito);
    }

    // 2️⃣ Buscar el precio unitario (usa precio_base si la fecha no tiene precio)
    const [fechaRes] = await pool.promise().query(`
      SELECT 
        CASE 
          WHEN f.precio IS NULL OR f.precio = 0 THEN e.precio_base 
          ELSE f.precio 
        END AS precio
      FROM FechasExcursion f
      JOIN Excursiones e ON f.id_excursion = e.id_excursion
      WHERE f.id_fecha = ?;
    `, [id_fecha]);

    if (fechaRes.length === 0) {
      console.error("❌ Fecha de excursión no encontrada:", id_fecha);
      return res.status(404).json({ message: "Fecha de excursión no encontrada" });
    }

    const precio_unitario = fechaRes[0].precio;
    console.log("💲 Precio encontrado:", precio_unitario);

    const subtotal = cantidad_personas * precio_unitario;
    console.log("🧮 Subtotal calculado:", subtotal);

    // 3️⃣ Insertar item en el carrito
    const [insertResult] = await pool.promise().query(
      "INSERT INTO CarritoItems (id_carrito, id_fecha, cantidad_personas, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
      [id_carrito, id_fecha, cantidad_personas, precio_unitario, subtotal]
    );

    console.log("✅ Item agregado correctamente:", insertResult.insertId);

    res.status(201).json({
      message: "Item agregado correctamente",
      id_item: insertResult.insertId,
      id_carrito,
    });
  } catch (err) {
    console.error("💥 Error interno al agregar item:", err);
    res.status(500).json({ message: "Error interno al agregar item", error: err.message });
  }
};

// Obtener items de un carrito
export const getItemsCarrito = (req, res) => {
  const { id_carrito } = req.params;

  const sql = `
    SELECT ci.id_item, e.titulo AS excursion, f.fecha, ci.cantidad_personas, 
           ci.precio_unitario, ci.subtotal
    FROM CarritoItems ci
    JOIN FechasExcursion f ON ci.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    WHERE ci.id_carrito = ? AND ci.eliminado = 0
  `;
  pool.query(sql, [id_carrito], (err, results) => {
    if (err) {
      console.error("Error al obtener items del carrito:", err);
      return res.status(500).json({ message: "Error al obtener items" });
    }
    res.json(results);
  });
};

// Eliminar item del carrito (baja lógica)
export const deleteItemCarrito = (req, res) => {
  const { id_item } = req.params;
  const sql = `
    UPDATE CarritoItems
    SET eliminado=1, fecha_eliminacion=NOW()
    WHERE id_item=?
  `;
  pool.query(sql, [id_item], (err, result) => {
    if (err) {
      console.error("Error al eliminar item:", err);
      return res.status(500).json({ message: "Error al eliminar item" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Item no encontrado" });
    res.json({ message: "Item eliminado (baja lógica) correctamente" });
  });
};
