const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function init() {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        device_id TEXT NOT NULL,
        creativity DECIMAL(2,1) NOT NULL,
        flavor DECIMAL(2,1) NOT NULL,
        presentation DECIMAL(2,1) NOT NULL,
        activity DECIMAL(2,1) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_vote ON votes(event_id, device_id);
    `);

    // Insert 3 initial events if they don't exist
    const eventsCount = await client.query('SELECT COUNT(*) FROM events');
    if (parseInt(eventsCount.rows[0].count) === 0) {
      await client.query("INSERT INTO events (name) VALUES ('Flor y Jorge'), ('Yas y Alex'), ('May y Cami')");
      console.log('Added initial events.');
    }

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
