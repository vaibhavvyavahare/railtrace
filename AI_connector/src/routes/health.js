import { Router } from 'express';
import { getDb } from '../utils/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const r = await db.query('SELECT NOW() as now');
    res.json({ status: 'ok', now: r.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;


