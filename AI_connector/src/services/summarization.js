import { getDb } from '../utils/db.js';
import { generateSummary } from './gemini.js';

function buildPrompt({ vendor, lots, batches, fittings, installations, maints }) {
  return [
    `Vendor: ${vendor.vendor_id} - ${vendor.vendor_name}`,
    `Lots: ${lots.length}, Batches: ${batches.length}, Fittings: ${fittings.length}`,
    `Installations: ${installations.length}, Maintenance Reports: ${maints.length}`,
  ].join('\n');
}

export async function generateAndStoreSummariesForVendor(vendorId) {
  const db = getDb();
  // fetch vendor scope
  const { rows: vendors } = await db.query('SELECT * FROM vendors WHERE vendor_id = $1', [vendorId]);
  if (!vendors.length) return { vendorId, created: 0 };
  const vendor = vendors[0];

  const { rows: lots } = await db.query('SELECT * FROM lots WHERE vendor_id = $1', [vendorId]);
  const lotIds = lots.map(l => l.lot_id);
  const { rows: batches } = await db.query('SELECT * FROM batches WHERE lot_id = ANY($1)', [lotIds]);
  const batchIds = batches.map(b => b.batch_id);
  const { rows: fittings } = batchIds.length ? await db.query('SELECT * FROM fittings WHERE batch_id = ANY($1)', [batchIds]) : { rows: [] };
  const { rows: installations } = fittings.length ? await db.query('SELECT * FROM installation_records WHERE fitting_id = ANY($1)', [fittings.map(f => f.fitting_id)]) : { rows: [] };
  const { rows: maints } = fittings.length ? await db.query('SELECT * FROM maintenance_records WHERE fitting_id = ANY($1)', [fittings.map(f => f.fitting_id)]) : { rows: [] };

  const prompt = buildPrompt({ vendor, lots, batches, fittings, installations, maints });
  const text = await generateSummary(prompt);

  const insertSql = `INSERT INTO summary_reports (summary_id, vendor_id, lot_id, batch_id, scope, summary_text)
                     VALUES ($1, $2, $3, $4, $5, $6)`;
  const scope = 'vendor';
  const id = `SUM-${vendorId}-${Date.now()}`;
  await db.query(insertSql, [id, vendorId, null, null, scope, text]);

  // lot level
  for (const lot of lots) {
    const lotBatches = batches.filter(b => b.lot_id === lot.lot_id);
    const lbIds = lotBatches.map(b => b.batch_id);
    const lotFittings = fittings.filter(f => lbIds.includes(f.batch_id));
    const lotInstalls = installations.filter(i => lotFittings.find(f => f.fitting_id === i.fitting_id));
    const lotMaints = maints.filter(m => lotFittings.find(f => f.fitting_id === m.fitting_id));
    const lotPrompt = buildPrompt({ vendor, lots: [lot], batches: lotBatches, fittings: lotFittings, installations: lotInstalls, maints: lotMaints });
    const lotText = await generateSummary(lotPrompt);
    const lotId = `SUM-${lot.lot_id}-${Date.now()}`;
    await db.query(insertSql, [lotId, vendorId, lot.lot_id, null, 'lot', lotText]);
  }

  // batch level
  for (const batch of batches) {
    const batchFittings = fittings.filter(f => f.batch_id === batch.batch_id);
    const batchInstalls = installations.filter(i => batchFittings.find(f => f.fitting_id === i.fitting_id));
    const batchMaints = maints.filter(m => batchFittings.find(f => f.fitting_id === m.fitting_id));
    const batchPrompt = buildPrompt({ vendor, lots, batches: [batch], fittings: batchFittings, installations: batchInstalls, maints: batchMaints });
    const batchText = await generateSummary(batchPrompt);
    const batchId = `SUM-${batch.batch_id}-${Date.now()}`;
    await db.query(insertSql, [batchId, vendorId, batch.lot_id, batch.batch_id, 'batch', batchText]);
  }

  return { vendorId, created: 1 + lots.length + batches.length };
}


