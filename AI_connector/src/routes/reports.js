import { Router } from 'express';
import { getDb } from '../utils/db.js';
import { generateAndStoreSummariesForVendor } from '../services/summarization.js';

const router = Router();

// list summaries
router.get('/', async (req, res) => {
  const { vendor_id, lot_id, batch_id, limit = 50 } = req.query;
  const params = [];
  const where = [];
  if (vendor_id) { params.push(vendor_id); where.push(`vendor_id = $${params.length}`); }
  if (lot_id) { params.push(lot_id); where.push(`lot_id = $${params.length}`); }
  if (batch_id) { params.push(batch_id); where.push(`batch_id = $${params.length}`); }
  const sql = `SELECT * FROM summary_reports ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(Number(limit));
  try {
    const db = getDb();
    const r = await db.query(sql, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// trigger regeneration (async simple)
router.post('/generate', async (req, res) => {
  try {
    const { vendor_id } = req.body;
    if (!vendor_id) return res.status(400).json({ message: 'vendor_id is required' });
    const result = await generateAndStoreSummariesForVendor(vendor_id);
    res.json({ status: 'ok', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


