import { getDb } from '../utils/db.js';

function needsMaintenance(fitting) {
  // Example heuristic: status not inspected recently or marked 'printed' for > 20 days
  const last = fitting.last_inspection ? new Date(fitting.last_inspection) : null;
  const days = last ? (Date.now() - last.getTime()) / (1000*60*60*24) : 999;
  return fitting.status !== 'inspected' && days > 20;
}

export async function evaluateAndStoreAlertsForVendor(vendorId) {
  const db = getDb();
  const { rows: lots } = await db.query('SELECT lot_id FROM lots WHERE vendor_id = $1', [vendorId]);
  const lotIds = lots.map(l => l.lot_id);
  const { rows: batches } = lotIds.length ? await db.query('SELECT batch_id, lot_id FROM batches WHERE lot_id = ANY($1)', [lotIds]) : { rows: [] };
  const batchIds = batches.map(b => b.batch_id);
  const { rows: fittings } = batchIds.length ? await db.query('SELECT * FROM fittings WHERE batch_id = ANY($1)', [batchIds]) : { rows: [] };

  let created = 0;
  for (const f of fittings) {
    if (needsMaintenance(f)) {
      const lotId = batches.find(b => b.batch_id === f.batch_id)?.lot_id || null;
      const alertId = `AL-${f.fitting_id}-${Date.now()}`;
      await db.query(
        `INSERT INTO maintenance_alerts (alert_id, vendor_id, lot_id, batch_id, fitting_id, alert_type, severity, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [alertId, vendorId, lotId, f.batch_id, f.fitting_id, 'inspection_due', 'medium', 'Fitting requires inspection based on heuristics.', 'open']
      );
      created++;
    }
  }
  return { vendorId, created };
}


