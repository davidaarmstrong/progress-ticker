const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Paths
const persistentDbPath = process.env.DB_PATH || '/data/db.sqlite';
const initialDbPath = path.join(__dirname, 'db.sqlite');

console.log('persistentDbPath:', persistentDbPath);
console.log('initialDbPath:', initialDbPath);

if (!fs.existsSync(persistentDbPath)) {
  fs.copyFileSync(initialDbPath, persistentDbPath);
  console.log(`Initialized persistent db.sqlite at ${persistentDbPath} from repo copy`);
}

// Initialize persistent db if needed
if (!fs.existsSync(persistentDbPath)) {
  fs.copyFileSync(initialDbPath, persistentDbPath);
  console.log('Initialized persistent db.sqlite from repo');
}

// Open database
const db = new sqlite3.Database(persistentDbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite DB at', persistentDbPath);
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint
app.get('/state', (req, res) => {
  const mode = req.query.mode || 'highest';
  const n = parseInt(req.query.n) || 10;

  let sql;
  if (mode === 'lowest') {
    sql = `SELECT county, current_value, previous_value 
           FROM counties 
           ORDER BY current_value ASC 
           LIMIT ?`;
  } else if (mode === 'change') {
    sql = `SELECT county, current_value, previous_value, 
                  ABS(current_value - previous_value) as diff
           FROM counties
           ORDER BY diff DESC
           LIMIT ?`;
  } else {
    sql = `SELECT county, current_value, previous_value 
           FROM counties 
           ORDER BY current_value DESC 
           LIMIT ?`;
  }

  db.all(sql, [n], (err, rows) => {
    if (err) {
      console.error('DB query error:', err.message);
      res.status(500).json({ error: 'Database query failed.' });
    } else {
      res.json(rows);
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Ticker API server running on port ${PORT}`);
});