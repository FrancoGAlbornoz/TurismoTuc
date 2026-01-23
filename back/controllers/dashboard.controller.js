// controllers/dashboard.controller.js
import { pool } from "../config/DB.js";

// =============================
// MÉTRICAS GENERALES DEL DASHBOARD
// =============================
export const getMetricas = (req, res) => {
  const sql = `
    SELECT
      /* Reservas de HOY - Filtramos canceladas y finalizadas */
      (SELECT COUNT(*)
       FROM Reservas r
       WHERE DATE(r.fecha_reserva) = CURDATE()
         AND r.eliminado = 0
         AND r.estado_reserva NOT IN ('cancelada', 'finalizada')) AS reservas_hoy,

      /* Reservas PRÓXIMAS - Filtramos canceladas y finalizadas */
      (SELECT COUNT(*)
       FROM Reservas r
       JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
       WHERE f.fecha > CURDATE()
         AND r.eliminado = 0
         AND r.estado_reserva NOT IN ('cancelada', 'finalizada')) AS reservas_proximas,

      /* Ocupación total */
      ROUND(
        IFNULL(
          (SELECT SUM(r.cantidad_personas) FROM Reservas r WHERE r.eliminado = 0 AND r.estado_reserva = 'confirmada'), 0
        ) / NULLIF(
          (SELECT SUM(f.cupo_maximo) FROM FechasExcursion f WHERE f.eliminado = 0), 0
        ) * 100, 1
      ) AS ocupacion,

      IFNULL(ROUND((SELECT AVG(rz.calificacion) FROM Reseñas rz WHERE rz.estado = 'publicada'), 1), 0) AS rating_promedio
  `;

  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error en métricas" });
    res.json(results[0]);
  });
};

// =============================
// RESERVAS DEL DÍA (TABLA SUPERIOR)
// =============================
export const getReservasHoy = (req, res) => {
  const sql = `
    SELECT r.id_reserva, t.nombre AS turista, e.titulo AS excursion, 
           f.fecha AS fecha_excursion, f.hora_salida, 
           r.cantidad_personas, r.estado_reserva, r.fecha_reserva
    FROM Reservas r
    JOIN Turistas t ON r.id_turista = t.id_turista
    JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    WHERE DATE(r.fecha_reserva) = CURDATE() 
      AND r.eliminado = 0
      AND r.estado_reserva NOT IN ('cancelada', 'finalizada') -- CAMBIO AQUÍ
    ORDER BY r.fecha_reserva DESC;
  `;

  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error en reservas hoy" });
    res.json(results);
  });
};

// =============================
// RESERVAS FUTURAS (CON CONTACTO)
// =============================
export const getReservasProximas = (req, res) => {
  const sql = `
    SELECT r.id_reserva, t.nombre AS turista, t.email, t.telefono, -- TRAEMOS CONTACTO
           e.titulo AS excursion, f.fecha, f.hora_salida, 
           r.cantidad_personas, r.estado_reserva
    FROM Reservas r
    JOIN Turistas t ON r.id_turista = t.id_turista
    JOIN FechasExcursion f ON r.id_fecha = f.id_fecha
    JOIN Excursiones e ON f.id_excursion = e.id_excursion
    WHERE f.fecha > CURDATE() 
      AND r.eliminado = 0
      AND r.estado_reserva NOT IN ('cancelada', 'finalizada') -- FILTRADO ACTIVO
    ORDER BY f.fecha ASC
    LIMIT 10;
  `;

  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error en reservas próximas" });
    res.json(results);
  });
};