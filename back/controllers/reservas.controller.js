// controllers/reservasController.js
import { pool } from "../config/DB.js";

// =============================
// RESERVAS
// =============================

// Obtener las reservas con información relacionada y filtro
export const getReservas = (req, res) => {
  //console.log("Query recibida:", req.query);

  const { filtro, estadoreserva, fechaDesde, fechaHasta } = req.query;
  const condiciones = [];

  // Filtro por activas/eliminadas
  if (filtro === "activas") condiciones.push("r.eliminado = 0");
  if (filtro === "eliminadas") condiciones.push("r.eliminado = 1");

  // Filtro por estado de reserva
  if (estadoreserva && estadoreserva !== "todas") {
    condiciones.push(`r.estado_reserva = '${estadoreserva}'`);
  }

  // Filtro por fecha (maneja todas las combinaciones)
  if (fechaDesde && fechaHasta) {
    condiciones.push(
      `DATE(r.fecha_reserva) BETWEEN '${fechaDesde}' AND '${fechaHasta}'`
    );
  } else if (fechaDesde) {
    condiciones.push(`DATE(r.fecha_reserva) >= '${fechaDesde}'`);
  } else if (fechaHasta) {
    condiciones.push(`DATE(r.fecha_reserva) <= '${fechaHasta}'`);
  }

  //console.log("Condiciones generadas:", condiciones);

  const whereClause =
    condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  const sql = `
    SELECT 
      r.id_reserva, 
      CONCAT(t.nombre, ' ', t.apellido) AS turista,
      e.titulo AS excursion,
      f.fecha AS fecha_excursion,
      r.cantidad_personas,
      r.monto_total,
      r.estado_reserva,
      r.fecha_reserva,
      r.eliminado
    FROM Reservas r
    JOIN Turistas t ON r.id_turista = t.id_turista
    JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    ${whereClause}
    ORDER BY r.fecha_reserva DESC;
  `;

  //console.log("SQL generada:", sql);

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener reservas:", err);
      return res.status(500).json({ message: "Error al obtener reservas" });
    }
    res.json(results);
  });
};

// Obtener reserva por ID
export const getReservaById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      r.id_reserva, 
      CONCAT(t.nombre, ' ', t.apellido) AS turista,
      e.titulo AS excursion,
      f.fecha AS fecha_excursion,
      r.cantidad_personas,
      r.monto_total,
      r.estado_reserva,
      r.fecha_reserva
    FROM Reservas r
    JOIN Turistas t ON r.id_turista = t.id_turista
    JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    WHERE r.id_reserva = ? AND r.eliminado = 0
  `;

  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener reserva:", err);
      return res.status(500).json({ message: "Error al obtener reserva" });
    }
    if (results.length === 0)
      return res.status(404).json({ message: "Reserva no encontrada" });
    res.json(results[0]);
  });
};

// Crear nueva reserva
export const createReserva = (req, res) => {
  const { id_turista, id_fecha, cantidad_personas, estado_reserva } = req.body;

  // Validar datos obligatorios
  if (!id_turista || !id_fecha || !cantidad_personas) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  // Primero obtener el precio de la excursión asociada a esta fecha y el cupo disponible
  const sqlPrecio = `
    SELECT e.precio_base, f.cupo_disponible
    FROM FechasExcursion f
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    WHERE f.id_fecha = ? AND f.eliminado = 0
  `;

  pool.query(sqlPrecio, [id_fecha], (err, results) => {
    if (err) {
      console.error("Error al obtener precio de excursión:", err);
      return res.status(500).json({ message: "Error al calcular monto total" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Fecha de excursión no encontrada" });
    }

    const precioBase = results[0].precio_base;
    const cupoDisponible = results[0].cupo_disponible;

    // Validar cupo disponible
    if (cantidad_personas > cupoDisponible) {
      return res
        .status(400)
        .json({ message: "No hay cupo suficiente para esta reserva" });
    }

    // Calcular el monto total y cupo nuevo
    const monto_total = precioBase * cantidad_personas;
    const nuevoCupo = cupoDisponible - cantidad_personas;

    // Insertar la reserva
    const sqlInsert = `
      INSERT INTO Reservas
      (id_fecha, id_turista, cantidad_personas, monto_total, estado_reserva)
      VALUES (?, ?, ?, ?, ?)
    `;

    pool.query(
      sqlInsert,
      [
        id_fecha,
        id_turista,
        cantidad_personas,
        monto_total,
        estado_reserva || "pendiente",
      ],
      (err2, result) => {
        if (err2)
          return res.status(500).json({ message: "Error al crear reserva" });

        // Actualizar cupo disponible en FechasExcursion
        const sqlUpdateCupo = `UPDATE FechasExcursion SET cupo_disponible = ? WHERE id_fecha = ?`;
        pool.query(sqlUpdateCupo, [nuevoCupo, id_fecha], (err3) => {
          if (err3) console.error("Error al actualizar cupo:", err3);

          res.status(201).json({
            message: "Reserva creada correctamente",
            id_reserva: result.insertId,
            monto_total,
            nuevoCupo, // Devolvemos el nuevo cupo
          });
        });
      }
    );
  });
};

// Actualizar estado o datos de una reserva
export const updateReserva = (req, res) => {
  const { id } = req.params;
  const { cantidad_personas, monto_total, estado_reserva } = req.body;

  const sql = `
    UPDATE Reservas
    SET cantidad_personas=?, monto_total=?, estado_reserva=?
    WHERE id_reserva=? AND eliminado=0
  `;
  const values = [cantidad_personas, monto_total, estado_reserva, id];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al actualizar reserva:", err);
      return res.status(500).json({ message: "Error al actualizar reserva" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Reserva no encontrada" });
    res.json({ message: "Reserva actualizada correctamente" });
  });
};

// Baja lógica de reserva
export const deleteReserva = (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE Reservas
    SET eliminado=1, fecha_eliminacion=NOW()
    WHERE id_reserva=?
  `;
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar reserva:", err);
      return res.status(500).json({ message: "Error al eliminar reserva" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Reserva no encontrada" });
    res.json({ message: "Reserva eliminada (baja lógica) correctamente" });
  });
};

export const restoreReserva = (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE Reservas
    SET eliminado = 0, fecha_eliminacion = NULL
    WHERE id_reserva = ?
  `;
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al restaurar reserva:", err);
      return res.status(500).json({ message: "Error al restaurar reserva" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Reserva no encontrada" });
    res.json({ message: "Reserva restaurada correctamente" });
  });
};

// =============================
// PAGOS
// =============================

// Obtener pagos con info relacionada
export const getPagos = (req, res) => {
  const sql = `
    SELECT 
      p.id_pago, 
      CONCAT(t.nombre, ' ', t.apellido) AS turista,
      e.titulo AS excursion,
      m.nombre_medio AS medio_pago,
      p.monto, p.moneda, p.estado_pago, p.fecha_pago
    FROM Pagos p
    JOIN Reservas r ON p.id_reserva = r.id_reserva
    JOIN Turistas t ON r.id_turista = t.id_turista
    JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    JOIN MediosPago m ON p.id_medio_pago = m.id_medio_pago
    WHERE p.eliminado = 0
    ORDER BY p.fecha_pago DESC;
  `;

  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener pagos:", err);
      return res.status(500).json({ message: "Error al obtener pagos" });
    }
    res.json(results);
  });
};

// Crear nuevo pago
export const createPago = (req, res) => {
  const { id_reserva, id_medio_pago, monto, estado_pago, moneda } = req.body;

  if (!id_reserva || !id_medio_pago || !monto)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  const sql = `
    INSERT INTO Pagos (id_reserva, id_medio_pago, monto, estado_pago, moneda)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    id_reserva,
    id_medio_pago,
    monto,
    estado_pago || "pendiente",
    moneda || "ARS",
  ];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al registrar pago:", err);
      return res.status(500).json({ message: "Error al registrar pago" });
    }
    res
      .status(201)
      .json({ message: "Pago registrado correctamente", id: result.insertId });
  });
};

// Baja lógica de pago
export const deletePago = (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE Pagos
    SET eliminado=1, fecha_eliminacion=NOW()
    WHERE id_pago=?
  `;
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar pago:", err);
      return res.status(500).json({ message: "Error al eliminar pago" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Pago no encontrado" });
    res.json({ message: "Pago eliminado (baja lógica) correctamente" });
  });
};
