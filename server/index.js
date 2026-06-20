require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'penyiramanot_db';

let pool;

async function initDb() {
  // connect without database to create it if missing
  const tmpConn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS });
  await tmpConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await tmpConn.end();

  // create pool for the specific database
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // run schema SQL file if exists
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    // naive split by ; to execute statements
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (e) {
        // ignore individual statement errors
        console.warn('schema exec error', e.message);
      }
    }
  }
}

// initialize DB before starting server
initDb().catch(err => {
  console.error('Failed to initialize DB:', err.message || err);
  process.exit(1);
});

// GET history (newest first)
app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, action, timestamp FROM watering_history ORDER BY id DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db' });
  }
});

// POST history
app.post('/api/history', async (req, res) => {
  try {
    const { action, timestamp } = req.body;
    await pool.query('INSERT INTO watering_history(action, timestamp) VALUES(?, ?)', [action, timestamp]);
    const [rows] = await pool.query('SELECT id, action, timestamp FROM watering_history ORDER BY id DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db' });
  }
});

// DELETE single history item
app.delete('/api/history/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM watering_history WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db' });
  }
});

// DELETE all history
app.delete('/api/history', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE watering_history');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db' });
  }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pump_settings WHERE id = 1');
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { mode, min_humidity, max_humidity, is_pump_on } = req.body;
    await pool.query(
      `INSERT INTO pump_settings (id, mode, min_humidity, max_humidity, is_pump_on)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE mode = VALUES(mode), min_humidity = VALUES(min_humidity), max_humidity = VALUES(max_humidity), is_pump_on = VALUES(is_pump_on)`,
      [mode, min_humidity, max_humidity, is_pump_on ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM pump_settings WHERE id = 1');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API listening on', port));
