const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'railtrace_db',
  password: 'peteraapte', // IMPORTANT: Replace with your actual password
  port: 5432,
});

// --- OFFICER DASHBOARD SUMMARY (ENHANCED) ---
router.get('/dashboard-summary', async (req, res) => {
  try {
    const vendorsQuery = pool.query('SELECT COUNT(*) FROM vendors');
    const ordersQuery = pool.query('SELECT COUNT(*) FROM orders');
    const itemsQuery = pool.query('SELECT COUNT(*) FROM installation_records');
    const statusQuery = pool.query("SELECT status, COUNT(*) FROM orders GROUP BY status");

    const [
        vendorsCount,
        ordersCount,
        itemsCount,
        statusCounts
    ] = await Promise.all([vendorsQuery, ordersQuery, itemsQuery, statusQuery]);

    const statuses = { completed: 0, inProgress: 0, pending: 0 };
    statusCounts.rows.forEach(row => {
        if (row.status === 'completed') statuses.completed = parseInt(row.count);
        if (row.status === 'in_process') statuses.inProgress = parseInt(row.count);
        if (row.status === 'pending') statuses.pending = parseInt(row.count);
    });

    res.status(200).json({
        vendors: parseInt(vendorsCount.rows[0].count),
        orders: parseInt(ordersCount.rows[0].count),
        items: parseInt(itemsCount.rows[0].count),
        ...statuses
    });
  } catch (err) {
    console.error('Officer Dashboard Summary Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching dashboard summary data', detail: err.message });
  }
});

// --- OFFICER VENDOR LIST ---
router.get('/vendors', async (req, res) => {
  try {
    const result = await pool.query('SELECT vendor_id, vendor_name, email, phone, address FROM vendors');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Officer Vendor List Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching vendor list', detail: err.message });
  }
});

// --- OFFICER ORDER LIST ---
router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT o.*, v.vendor_name FROM orders o JOIN vendors v ON o.vendor_id = v.vendor_id ORDER BY o.order_id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Officer Order List Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching order list', detail: err.message });
  }
});

// --- OFFICER INSTALLED ITEMS LIST (NEW) ---
router.get('/fittings', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ir.fitting_id,
        ir.installed_at,
        ir.location_lat,
        ir.location_long,
        ir.status AS installation_status,
        w.worker_name AS installer_name
      FROM installation_records ir
      LEFT JOIN workers w ON ir.worker_id = w.worker_id
      ORDER BY ir.installed_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Officer Installed Items List Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching installed items list', detail: err.message });
  }
});

// --- OFFICER FITTING DETAILS ---
router.get('/fitting/:fittingId', async (req, res) => {
  const { fittingId } = req.params;
  try {
    const fittingResult = await pool.query(
      `SELECT
        f.fitting_id,
        f.item_number,
        f.status AS fitting_status,
        f.last_inspection,
        b.batch_id,
        b.qr_data,
        b.is_qr_printed,
        b.printed_at,
        o.order_id,
        o.component_type,
        o.quantity,
        o.status AS order_status,
        o.order_type,
        v.vendor_id,
        v.vendor_name,
        ir.record_id AS installation_record_id,
        ir.installed_at,
        ir.location_lat,
        ir.location_long,
        ir.notes AS installation_notes,
        w.worker_id AS installer_id,
        w.worker_name AS installer_name
      FROM fittings f
      JOIN batches b ON f.batch_id = b.batch_id
      JOIN orders o ON b.order_id = o.order_id
      JOIN vendors v ON o.vendor_id = v.vendor_id
      LEFT JOIN installation_records ir ON f.fitting_id = ir.fitting_id
      LEFT JOIN workers w ON ir.worker_id = w.worker_id
      WHERE f.fitting_id = $1`,
      [fittingId]
    );

    if (fittingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Fitting not found.' });
    }

    const fittingDetails = fittingResult.rows[0];

    // Get maintenance records for this fitting
    const maintenanceRecordsResult = await pool.query(
      'SELECT * FROM maintenance_records WHERE fitting_id = $1 ORDER BY reported_at DESC',
      [fittingId]
    );
    fittingDetails.maintenance_records = maintenanceRecordsResult.rows;

    // Get associated files for this fitting
    const filesResult = await pool.query(
      'SELECT * FROM files WHERE related_id = $1 ORDER BY uploaded_at DESC',
      [fittingId]
    );
    fittingDetails.associated_files = filesResult.rows;

    res.status(200).json(fittingDetails);
  } catch (err) {
    console.error('Officer Fitting Details Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching fitting details', detail: err.message });
  }
});

module.exports = router;