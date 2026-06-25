import { pool } from "./config/DB.js";

async function runMigration() {
  try {
    console.log("Adding fecha_creacion to Multimedia...");
    await pool.promise().query(
      `ALTER TABLE Multimedia ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    );
    console.log("Migration successful.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists. Skipping.");
    } else {
      console.error("Migration failed:", err);
    }
  } finally {
    process.exit(0);
  }
}

runMigration();
