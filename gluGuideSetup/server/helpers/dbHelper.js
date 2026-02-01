const pool = require('../config/db');

/**
 * Führt eine Datenbank-Transaktion durch (Execute Around Method Pattern).
 * @param {Function} callback - Die Funktion, die innerhalb der Transaktion ausgeführt wird. Erhält 'client' als Parameter.
 */
const executeTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client); 
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error; 
  } finally {
    client.release(); 
  }
};

module.exports = { executeTransaction };