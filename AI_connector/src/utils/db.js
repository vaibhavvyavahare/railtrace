import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

let sharedPool;

export function createDbPool() {
  if (sharedPool) return sharedPool;
  sharedPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  return sharedPool;
}

export function getDb() {
  return createDbPool();
}


