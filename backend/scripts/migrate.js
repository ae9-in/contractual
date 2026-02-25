const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const migrationsDir = path.join(__dirname, '..', 'sql', 'migrations');

function splitStatements(sql) {
  return sql
    .split(/;\s*\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function run() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`,
    );

    const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(appliedRows.map((row) => row.filename));

    const files = fs
      .readdirSync(migrationsDir)
      .filter((name) => name.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = splitStatements(sql);
      for (const statement of statements) {
        await connection.query(statement);
      }

      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      console.log(`applied: ${file}`);
    }

    await connection.commit();
    console.log('migration complete');
  } catch (error) {
    await connection.rollback();
    console.error('migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

run();
