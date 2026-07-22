import { pool } from "../config/DB.js"; 

// =========================================================
// 1. Obtiene todas las excursiones activas (Controller)
//    Ruta: GET /api/bot/excursiones/activas
// =========================================================
export const getExcursionesActivasBot = (req, res) => {
  const sql = `
      SELECT 
        id_excursion,
        titulo,
        descripcion,
        precio_base,
        duracion,
        ubicacion,
        incluye
      FROM Excursiones
      WHERE estado = 'activa' AND eliminado = 0
      ORDER BY titulo
    `;
    

  pool.query(sql, (err, rows) => { // 👈 Usamos 'rows' aquí, ya que 'values' es más común para INSERT/UPDATE.
      if (err) {
          console.error("❌ Error al obtener excursiones para el bot:", err.message);
          return res.status(500).json({ 
              message: "Error interno al obtener excursiones",
              error: err.message 
          });
      }
      return res.json(rows);
  });
};

// =========================================================
// 2. Obtiene una excursión específica por ID (Controller)
//    Ruta: GET /api/bot/excursiones/:id
// =========================================================
export const getExcursionPorIdBot = (req, res) => {
    const { id } = req.params; 
    
    const sql = `
        SELECT 
            id_excursion,
            titulo,
            descripcion,
            precio_base,
            duracion,
            ubicacion,
            incluye,
            politicas
        FROM Excursiones
        WHERE id_excursion = ? AND estado = 'activa' AND eliminado = 0
    `;
    
    pool.query(sql, [id], (err, rows) => {
        if (err) {
            console.error("❌ Error al obtener excursión por ID para el bot:", err.message);
            return res.status(500).json({ 
                message: "Error interno al obtener excursión",
                error: err.message 
            });
        }
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Excursión no encontrada" });
        }
        return res.json(rows[0]);
    });
};


// =========================================================
// 3. Obtiene fechas disponibles de una excursión (Controller)
//    Ruta: GET /api/bot/excursiones/:id/fechas
// =========================================================
export const getFechasDisponiblesBot = (req, res) => {
    const { id } = req.params; 

    const sql = `
        SELECT 
            f.id_fecha,
            f.fecha,
            f.hora_salida,
            f.cupo_disponible,
            e.titulo,
            e.precio_base
        FROM FechasExcursion f
        JOIN Excursiones e ON f.id_excursion = e.id_excursion
        WHERE f.id_excursion = ? 
          AND f.estado = 'abierta' 
          AND f.eliminado = 0
          AND f.fecha >= CURDATE()
        ORDER BY f.fecha, f.hora_salida
    `;
    
    pool.query(sql, [id], (err, rows) => {
        if (err) {
            console.error("❌ Error al obtener fechas para el bot:", err.message);
            return res.status(500).json({ 
                message: "Error interno al obtener fechas",
                error: err.message 
            });
        }
        return res.json(rows);
    });
};