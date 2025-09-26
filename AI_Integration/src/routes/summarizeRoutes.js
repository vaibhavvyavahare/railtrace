import express from 'express';
import { summarizeVendor, summarizeBatch } from '../services/summaryService.js';

const router = express.Router();

router.get('/vendor/:vendorId/summary', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const result = await summarizeVendor(vendorId);
    if (!result) return res.status(404).json({ message: 'Vendor not found' });
    res.json(result);
  } catch (err) {
    console.error('AI vendor summary error:', err);
    res.status(500).json({ message: 'Failed to generate vendor summary', detail: err.message });
  }
});

router.get('/batch/:batchId/summary', async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await summarizeBatch(batchId);
    if (!result) return res.status(404).json({ message: 'Batch not found' });
    res.json(result);
  } catch (err) {
    console.error('AI batch summary error:', err);
    res.status(500).json({ message: 'Failed to generate batch summary', detail: err.message });
  }
});

export default router;


