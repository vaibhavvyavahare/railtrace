const { Pool } = require('pg');

// Database configuration with better error handling
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'railtrace_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'vaibhav',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: false, // Disable SSL for local development
});

// Test database connection
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err);
  console.error('❌ Client info:', client ? 'Client exists' : 'No client');
});

// Test initial connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    console.error('❌ Make sure PostgreSQL is running and database "railtrace_db" exists');
  }
};

// Run connection test
testConnection();

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query
};
