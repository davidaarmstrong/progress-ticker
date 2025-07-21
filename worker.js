const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Paths
const persistentDbPath = process.env.DB_PATH || '/data/db.sqlite';
const initialDbPath = path.join(__dirname, 'db.sqlite');

console.log('persistentDbPath:', persistentDbPath);
console.log('initialDbPath:', initialDbPath);

if (!fs.existsSync(persistentDbPath)) {
  fs.copyFileSync(initialDbPath, persistentDbPath);
  console.log(`Initialized persistent db.sqlite at ${persistentDbPath} from repo copy`);
}

// Open database
const db = new sqlite3.Database(persistentDbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite DB at', persistentDbPath);
  }
});

// Parameters
const minValue = 0;
const maxValue = 100;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function smallRandomStep(group) {
  const magnitude = Math.random() * 0.01;
  let step;

  if (group === 1) {
    step = Math.random() < 2/3 ? magnitude : -magnitude;
  } else if (group === 2) {
    step = Math.random() < 2/3 ? -magnitude : magnitude;
  } else {
    step = Math.random() < 0.5 ? magnitude : -magnitude;
  }

  return step;
}

function updateAllCounties() {
  console.log("Starting county update...");

  db.serialize(() => {
    db.all("SELECT county, current_value, `group` FROM counties", (err, rows) => {
      if (err) {
        console.error("Error reading counties:", err.message);
        return;
      }

      const stmt = db.prepare("UPDATE counties SET previous_value = current_value, current_value = ? WHERE county = ?");

      rows.forEach(row => {
        let delta = smallRandomStep(row.group);
        let newVal = row.current_value + delta;  // Unbounded walk
        stmt.run(newVal, row.county);
      });

      stmt.finalize();
      console.log(`Updated ${rows.length} counties at ${new Date().toISOString()}`);
    });
  });
}

// Initial update
updateAllCounties();

// Schedule updates every 30 seconds
setInterval(updateAllCounties, 30 * 1000);