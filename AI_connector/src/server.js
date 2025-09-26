import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createDbPool } from './utils/db.js';
import healthRouter from './routes/health.js';
import reportsRouter from './routes/reports.js';
import alertsRouter from './routes/alerts.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// routes
app.use('/health', healthRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/alerts', alertsRouter);

const PORT = process.env.AI_CONNECTOR_PORT || 5055;

// init DB at startup to fail fast
const pool = createDbPool();
pool.query('SELECT 1').then(() => {
  console.log('[AI_connector] DB connected');
}).catch((err) => {
  console.error('[AI_connector] DB connection failed', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`[AI_connector] listening on port ${PORT}`);
});


