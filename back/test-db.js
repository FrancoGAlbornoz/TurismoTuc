import { pool } from './config/DB.js';

async function test() {
  const [rows] = await pool.promise().query('SELECT * FROM CarritoItems LIMIT 1');
  console.log("Item:", rows[0]);
  process.exit(0);
}
test();
