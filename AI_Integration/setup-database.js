const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT) || 5432,
  database: 'postgres', // Connect to default postgres database first
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'vaibhav',
  ssl: false,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up database...');
    
    // Check if railtrace_db exists
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'railtrace_db'"
    );
    
    if (dbExists.rows.length === 0) {
      console.log('📦 Creating railtrace_db database...');
      await client.query('CREATE DATABASE railtrace_db');
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }
    
    // Now connect to the railtrace_db
    await client.end();
    const railtraceClient = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT) || 5432,
      database: 'railtrace_db',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'vaibhav',
      ssl: false,
    }).connect();
    
    const railtrace = await railtraceClient;
    
    // Check if tables exist
    const tablesExist = await railtrace.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'vendors'
    `);
    
    if (tablesExist.rows.length === 0) {
      console.log('📋 Creating tables from database.sql...');
      
      // Read and execute the SQL file
      const sqlPath = path.join(__dirname, '..', 'database.sql');
      if (fs.existsSync(sqlPath)) {
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        await railtrace.query(sqlContent);
        console.log('✅ Tables created successfully');
      } else {
        console.log('⚠️  database.sql file not found, creating basic tables...');
        
        // Create basic tables
        await railtrace.query(`
          CREATE TABLE IF NOT EXISTS vendors (
            vendor_id VARCHAR(50) PRIMARY KEY,
            vendor_name VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            phone VARCHAR(20),
            address TEXT
          );
        `);
        
        await railtrace.query(`
          CREATE TABLE IF NOT EXISTS orders (
            order_id VARCHAR(50) PRIMARY KEY,
            vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
            component_type VARCHAR(100),
            quantity INT,
            status VARCHAR(50) DEFAULT 'pending',
            order_type VARCHAR(50)
          );
        `);
        
        console.log('✅ Basic tables created');
      }
    } else {
      console.log('✅ Tables already exist');
    }
    
    await railtrace.release();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Make sure PostgreSQL is running and credentials are correct');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase();
