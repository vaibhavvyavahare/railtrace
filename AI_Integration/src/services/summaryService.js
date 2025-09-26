import { query } from '../lib/db.js';
import { generateTextSummary } from '../lib/sarvam.js';

function buildVendorPrompt({ vendor, lots, batches, fittings, installations, maintenances }) {
  return [
    `You are an analytics assistant for a railway components tracking system.`,
    `Provide a concise performance summary and prioritized alerts.`,
    `Vendor: ${vendor.vendor_id} - ${vendor.vendor_name}`,
    `Data:`,
    `Lots: ${lots.length}`,
    `Batches: ${batches.length}`,
    `Fittings: ${fittings.length}`,
    `Installations: ${installations.length}`,
    `Maintenance Records: ${maintenances.length}`,
    `Recent installation statuses: ${installations.slice(0,10).map(x => x.status).join(', ')}`,
    `Recent maintenance statuses: ${maintenances.slice(0,10).map(x => x.status).join(', ')}`,
    `Tasks:`,
    `1) Summarize quality/performance trends per lot/batch.`,
    `2) Flag overdue inspections or high maintenance frequency.`,
    `3) Estimate upcoming service/expiry risks if suggested by data.`,
    `4) Output JSON with {summary, alerts: [{severity, message, ref}]}.`
  ].join('\n');
}

export async function getVendorData(vendorId) {
  const [vendor] = await query('SELECT vendor_id, vendor_name FROM vendors WHERE vendor_id = $1', [vendorId]);
  if (!vendor) return null;

  const lots = await query('SELECT * FROM lots WHERE vendor_id = $1 ORDER BY created_at DESC', [vendorId]);
  const lotIds = lots.map(l => l.lot_id);
  const batches = lotIds.length
    ? await query('SELECT * FROM batches WHERE lot_id = ANY($1)', [lotIds])
    : [];
  const batchIds = batches.map(b => b.batch_id);
  const fittings = batchIds.length
    ? await query('SELECT * FROM fittings WHERE batch_id = ANY($1)', [batchIds])
    : [];
  const installations = fittings.length
    ? await query('SELECT * FROM installation_records WHERE fitting_id = ANY($1) ORDER BY installed_at DESC', [fittings.map(f => f.fitting_id)])
    : [];
  const maintenances = fittings.length
    ? await query('SELECT * FROM maintenance_records WHERE fitting_id = ANY($1) ORDER BY reported_at DESC', [fittings.map(f => f.fitting_id)])
    : [];

  return { vendor, lots, batches, fittings, installations, maintenances };
}

export async function summarizeVendor(vendorId) {
  const data = await getVendorData(vendorId);
  if (!data) return null;
  const prompt = buildVendorPrompt(data);
  const ai = await generateTextSummary({ prompt });
  return { data, ai };
}

export async function summarizeBatch(batchId) {
  const batch = (await query('SELECT * FROM batches WHERE batch_id = $1', [batchId]))[0];
  if (!batch) return null;
  const lot = (await query('SELECT * FROM lots WHERE lot_id = $1', [batch.lot_id]))[0];
  const order = (await query('SELECT * FROM orders WHERE order_id = $1', [batch.order_id]))[0];
  const vendor = order ? (await query('SELECT vendor_id, vendor_name FROM vendors WHERE vendor_id = $1', [order.vendor_id]))[0] : null;
  const fittings = await query('SELECT * FROM fittings WHERE batch_id = $1', [batchId]);
  const fittingIds = fittings.map(f => f.fitting_id);
  const installations = fittingIds.length
    ? await query('SELECT * FROM installation_records WHERE fitting_id = ANY($1) ORDER BY installed_at DESC', [fittingIds])
    : [];
  const maintenances = fittingIds.length
    ? await query('SELECT * FROM maintenance_records WHERE fitting_id = ANY($1) ORDER BY reported_at DESC', [fittingIds])
    : [];

  const prompt = [
    `Summarize performance for Batch ${batch.batch_id} (Lot ${batch.lot_id}).`,
    `Vendor: ${vendor ? vendor.vendor_name : 'Unknown'}`,
    `Component Type: ${order ? order.component_type : 'Unknown'}`,
    `Items: ${fittings.length}`,
    `Recent installation statuses: ${installations.slice(0,10).map(x => x.status).join(', ')}`,
    `Recent maintenance statuses: ${maintenances.slice(0,10).map(x => x.status).join(', ')}`,
    `Output JSON {summary, alerts:[{severity,message,ref}]}`
  ].join('\n');

  const ai = await generateTextSummary({ prompt });
  return { batch, lot, vendor, order, fittings, installations, maintenances, ai };
}


