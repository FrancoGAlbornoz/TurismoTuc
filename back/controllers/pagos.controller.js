import { pool } from "../config/DB.js";
import "dotenv/config.js";

/* ============================================================
   💳 SIMULACIÓN LOCAL DE PAYWAY
   ============================================================ */
export const iniciarPagoPayway = async (req, res) => {
  const { id_reserva } = req.body;

  try {
    // 1️⃣ Buscar la reserva
    const [rows] = await pool.promise().query(
      `
      SELECT 
        r.id_reserva, r.monto_total, r.id_turista, r.cantidad_personas, r.id_fecha,
        t.email, t.nombre, t.apellido
      FROM Reservas r
      JOIN Turistas t ON r.id_turista = t.id_turista
      WHERE r.id_reserva = ?
      `,
      [id_reserva]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Reserva no encontrada" });

    const reserva = rows[0];

    // 2️⃣ Simulamos un pago exitoso (sandbox local)
    const fakePayment = {
      id: `sim-${Date.now()}`,
      status: "approved",
      amount: reserva.monto_total,
      currency: "ARS",
      site_transaction_id: `RES-${reserva.id_reserva}`,
      message: "Pago simulado localmente (sin conexión a Payway)",
    };

    // 3️⃣ Registrar el pago
    await pool.promise().query(
      `
      INSERT INTO Pagos (id_reserva, id_medio_pago, monto, estado_pago, moneda)
      VALUES (
        ?, 
        (SELECT id_medio_pago FROM MediosPago WHERE nombre_medio='Payway' LIMIT 1), 
        ?, 
        'aprobado', 
        'ARS'
      )
      `,
      [id_reserva, reserva.monto_total]
    );

    // 4️⃣ Actualizar reserva a confirmada
    await pool.promise().query(
      `
      UPDATE Reservas
      SET estado_reserva = 'confirmada'
      WHERE id_reserva = ?
      `,
      [id_reserva]
    );

    // 5️⃣ 🔹 Descontar cupo solo al confirmar pago
    await pool.promise().query(
      `
      UPDATE FechasExcursion f
      JOIN Reservas r ON f.id_fecha = r.id_fecha
      SET f.cupo_disponible = GREATEST(f.cupo_disponible - r.cantidad_personas, 0)
      WHERE r.id_reserva = ? AND r.estado_reserva = 'confirmada'
      `,
      [id_reserva]
    );

    console.log(`✅ Pago simulado con éxito para la reserva ${id_reserva}`);

    // 6️⃣ Devolver al frontend
    res.status(200).json({
      message: "Pago simulado correctamente (modo local)",
      data: {
        id_reserva: reserva.id_reserva,
        monto_total: reserva.monto_total,
        metodo: "Payway",
      },
    });
  } catch (error) {
    console.error("❌ Error al simular pago:", error);
    res.status(500).json({ message: "Error al simular pago" });
  }
};

/* ============================================================
   📦 CALLBACK SIMULADO PAYWAY
   ============================================================ */
export const callbackPayway = async (req, res) => {
  const { site_transaction_id, status } = req.body;

  if (!site_transaction_id)
    return res.status(400).json({ message: "Falta site_transaction_id" });

  const id_reserva = parseInt(site_transaction_id.replace("RES-", ""));
  const estadoPago = status === "approved" ? "aprobado" : "rechazado";
  const estadoReserva = status === "approved" ? "confirmada" : "cancelada";

  try {
    await pool.promise().query(
      `
      UPDATE Pagos p
      JOIN Reservas r ON p.id_reserva = r.id_reserva
      SET 
        p.estado_pago = ?, 
        r.estado_reserva = ?
      WHERE p.id_reserva = ?
      `,
      [estadoPago, estadoReserva, id_reserva]
    );

    // 🔹 Si se aprueba → descontar cupo
    if (estadoPago === "aprobado") {
      await pool.promise().query(
        `
        UPDATE FechasExcursion f
        JOIN Reservas r ON f.id_fecha = r.id_fecha
        SET f.cupo_disponible = GREATEST(f.cupo_disponible - r.cantidad_personas, 0)
        WHERE r.id_reserva = ?
        `,
        [id_reserva]
      );
    }

    console.log(`✅ Callback Payway: reserva ${id_reserva} → ${estadoPago}`);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en callback Payway:", error);
    res.sendStatus(500);
  }
};

/* ============================================================
   💰 TRANSFERENCIA / DEPÓSITO
   ============================================================ */
export const registrarTransferencia = async (req, res) => {
  const { id_reserva, referencia } = req.body;

  try {
    const [rows] = await pool.promise().query(
      `
      SELECT id_reserva, monto_total, id_turista
      FROM Reservas
      WHERE id_reserva = ? AND eliminado = 0
      `,
      [id_reserva]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Reserva no encontrada" });

    const reserva = rows[0];

    await pool.promise().query(
      `
      INSERT INTO Pagos (id_reserva, id_medio_pago, monto, estado_pago, moneda, referencia)
      VALUES (
        ?,
        (SELECT id_medio_pago FROM MediosPago WHERE nombre_medio='Transferencia/Depósito' LIMIT 1),
        ?,
        'pendiente',
        'ARS',
        ?
      )
      `,
      [id_reserva, reserva.monto_total, referencia || null]
    );

    await pool.promise().query(
      `
      UPDATE Reservas
      SET estado_reserva = 'pendiente'
      WHERE id_reserva = ?
      `,
      [id_reserva]
    );

    console.log(`✅ Transferencia registrada para reserva ${id_reserva}`);

    res.status(201).json({
      message: "Transferencia registrada correctamente. Pendiente de verificación.",
      data: {
        id_reserva,
        monto_total: reserva.monto_total,
        metodo: "Transferencia/Depósito",
      },
    });
  } catch (error) {
    console.error("❌ Error al registrar transferencia:", error);
    res.status(500).json({ message: "Error al registrar transferencia" });
  }
};

/* ============================================================
   🧾 CRUD ADMIN DE PAGOS
   ============================================================ */

// 🟢 Obtener todos los pagos (con info del turista y método)
export const getPagos = async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
      SELECT 
        p.id_pago,
        p.id_reserva,
        p.monto,
        p.estado_pago,
        p.moneda,
        p.referencia,
        p.fecha_pago,
        mp.nombre_medio AS metodo,
        t.nombre AS turista_nombre,
        t.apellido AS turista_apellido,
        r.estado_reserva
      FROM Pagos p
      LEFT JOIN MediosPago mp ON p.id_medio_pago = mp.id_medio_pago
      LEFT JOIN Reservas r ON p.id_reserva = r.id_reserva
      LEFT JOIN Turistas t ON r.id_turista = t.id_turista
      ORDER BY p.fecha_pago DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener pagos:", err);
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};

// 🟡 Actualizar estado del pago (confirmar/rechazar)
export const updatePagoEstado = async (req, res) => {
  const { id_pago } = req.params;
  const { nuevo_estado, referencia } = req.body;

  if (!["pendiente", "aprobado", "rechazado"].includes(nuevo_estado)) {
    return res.status(400).json({ message: "Estado inválido." });
  }

  try {
    const [rows] = await pool.promise().query(
      `
      SELECT 
        p.id_pago,
        p.estado_pago AS estado_actual,
        p.id_reserva,
        r.id_fecha,
        r.cantidad_personas
      FROM Pagos p
      INNER JOIN Reservas r ON p.id_reserva = r.id_reserva
      WHERE p.id_pago = ?
      `,
      [id_pago]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    const pago = rows[0];

    // 🔹 Actualizar pago
    await pool.promise().query(
      `
      UPDATE Pagos
      SET estado_pago = ?, referencia = COALESCE(?, referencia)
      WHERE id_pago = ?
      `,
      [nuevo_estado, referencia, id_pago]
    );

    // 🔸 Si se aprueba → descontar cupo y confirmar reserva
    if (nuevo_estado === "aprobado" && pago.estado_actual !== "aprobado") {
      await pool.promise().query(
        `
        UPDATE FechasExcursion
        SET cupo_disponible = GREATEST(cupo_disponible - ?, 0)
        WHERE id_fecha = ? AND cupo_disponible >= ?
        `,
        [pago.cantidad_personas, pago.id_fecha, pago.cantidad_personas]
      );

      await pool.promise().query(
        `
        UPDATE Reservas
        SET estado_reserva = 'confirmada'
        WHERE id_reserva = ?
        `,
        [pago.id_reserva]
      );
    }

    // 🔻 Si se rechaza → cancelar reserva
    if (nuevo_estado === "rechazado") {
      await pool.promise().query(
        `
        UPDATE Reservas
        SET estado_reserva = 'cancelada'
        WHERE id_reserva = ?
        `,
        [pago.id_reserva]
      );
    }

    res.json({ message: "Pago actualizado correctamente." });
  } catch (err) {
    console.error("❌ Error al actualizar pago:", err);
    res.status(500).json({ message: "Error al actualizar el pago" });
  }
};

// 🔴 Eliminar pago
export const deletePago = async (req, res) => {
  const { id_pago } = req.params;
  try {
    await pool.promise().query(`DELETE FROM Pagos WHERE id_pago = ?`, [id_pago]);
    res.json({ message: "Pago eliminado correctamente." });
  } catch (err) {
    console.error("❌ Error al eliminar pago:", err);
    res.status(500).json({ message: "Error al eliminar pago" });
  }
};
