import { Router } from 'express';
import { getDb } from '../utils/db.js';
import { evaluateAndStoreAlertsForVendor } from '../services/alerts.js';

const router = Router();

router.get('/', async (req, res) => {
  const { vendor_id, fitting_id, batch_id, status, limit = 50 } = req.query;
  const params = [];
  const where = [];
  if (vendor_id) { params.push(vendor_id); where.push(`vendor_id = $${params.length}`); }
  if (fitting_id) { params.push(fitting_id); where.push(`fitting_id = $${params.length}`); }
  if (batch_id) { params.push(batch_id); where.push(`batch_id = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  const sql = `SELECT * FROM maintenance_alerts ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(Number(limit));
  try {
    const db = getDb();
    const r = await db.query(sql, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

// Trigger vendor alert evaluation
router.post('/evaluate', async (req, res) => {
  try {
    const { vendor_id } = req.body;
    if (!vendor_id) return res.status(400).json({ message: 'vendor_id is required' });
    const result = await evaluateAndStoreAlertsForVendor(vendor_id);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


