const express = require('express');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const officerRoutes = require('./routes/officer');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.use('/api/officer', officerRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.status(200).json({ message: 'API is working!' });
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'railtrace_db',
  password: 'peteraapte', // IMPORTANT: Replace with your actual password
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// --- GOOGLE DRIVE SETUP ---
// This is a placeholder for Google Drive API setup
// In a real implementation, you would need to set up OAuth2 credentials
// and configure the Google Drive API client

const auth = new google.auth.GoogleAuth({
  // Add your Google Drive API credentials here
  // keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
  version: 'v3',
  auth,
});

// --- VENDOR AUTHENTICATION ---

app.post('/api/vendor/register', async (req, res) => {
  const { vendor_id, vendor_name, password } = req.body;
  if (!vendor_id || !vendor_name || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Storing plain text password as requested
    const result = await pool.query(
      'INSERT INTO vendors (vendor_id, vendor_name, password) VALUES ($1, $2, $3) RETURNING vendor_id',
      [vendor_id, vendor_name, password]
    );
    res.status(201).json({ message: 'Vendor registered successfully', vendor: result.rows[0] });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Error registering vendor', detail: err.detail });
  }
});

app.post('/api/vendor/login', async (req, res) => {
  const { vendor_id, password } = req.body;
  if (!vendor_id || !password) {
    return res.status(400).json({ message: 'Vendor ID and password are required.' });
  }

  try {
    console.log(`[Login Attempt] Received login request for vendor_id: ${vendor_id}`);
    const result = await pool.query('SELECT * FROM vendors WHERE vendor_id = $1', [vendor_id]);

    if (result.rows.length === 0) {
      console.log(`[Login Failure] Vendor '${vendor_id}' not found in database.`);
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const vendor = result.rows[0];
    console.log(`[Login Info] Password from DB: '${vendor.password}'`);
    console.log(`[Login Info] Password from User: '${password}'`);

    // Plain text password comparison
    const match = (password === vendor.password);
    console.log(`[Login Info] Comparison result (password === vendor.password): ${match}`);

    if (match) {
      console.log(`[Login Success] Passwords match.`);
      res.status(200).json({ 
        message: 'Login successful', 
        vendor_id: vendor.vendor_id, 
        vendor_name: vendor.vendor_name,
        user_type: 'vendor'
      });
    } else {
      console.log(`[Login Failure] Passwords do not match.`);
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login', detail: err.message });
  }
});

// --- OFFICER AUTHENTICATION ---

app.post('/api/officer/login', async (req, res) => {
  const { officer_id, password } = req.body;
  if (!officer_id || !password) {
    return res.status(400).json({ message: 'Officer ID and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM officers WHERE officer_id = $1', [officer_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Officer not found.' });
    }

    const officer = result.rows[0];

    // Plain text password comparison
    const match = (password === officer.password);

    if (match) {
      res.status(200).json({ 
        message: 'Login successful', 
        officer_id: officer.officer_id, 
        officer_name: officer.officer_name,
        department: officer.department,
        role: officer.role,
        user_type: 'officer'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Officer Login Error:', err);
    res.status(500).json({ message: 'Server error during login', detail: err.message });
  }
});

// --- UNIFIED AUTHENTICATION ---

app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  const { user_id, password } = req.body;
  if (!user_id || !password) {
    console.log('Missing credentials in request');
    return res.status(400).json({ message: 'User ID and password are required.' });
  }
  
  console.log(`Processing login for user_id: ${user_id}`);

  try {
    // Check if it's a vendor (V-xxx)
    if (user_id.startsWith('V-')) {
      console.log(`Checking vendor with ID: ${user_id}`);
      const result = await pool.query('SELECT * FROM vendors WHERE vendor_id = $1', [user_id]);
      console.log(`Vendor query result rows: ${result.rows.length}`);
      
      if (result.rows.length > 0) {
        const vendor = result.rows[0];
        console.log(`Found vendor: ${vendor.vendor_name}, comparing passwords...`);
        const match = (password === vendor.password);
        console.log(`Password match: ${match}`);
        
        if (match) {
          console.log(`Login successful for vendor: ${vendor.vendor_name}`);
          return res.status(200).json({
            message: 'Login successful',
            vendor_id: vendor.vendor_id,
            vendor_name: vendor.vendor_name,
            user_type: 'vendor'
          });
        } else {
          console.log('Invalid password for vendor');
        }
      } else {
        console.log(`No vendor found with ID: ${user_id}`);
      }
    }
    
    // Check if it's an officer (O-xxx)
    else if (user_id.startsWith('O-')) {
      const result = await pool.query('SELECT * FROM officers WHERE officer_id = $1', [user_id]);
      if (result.rows.length > 0) {
        const officer = result.rows[0];
        if (password === officer.password) {
          return res.status(200).json({
            message: 'Login successful',
            officer_id: officer.officer_id,
            officer_name: officer.officer_name,
            department: officer.department,
            role: officer.role,
            user_type: 'officer'
          });
        }
      }
    }
    
    // Check if it's a worker (W-xxx)
    else if (user_id.startsWith('W-')) {
      const result = await pool.query('SELECT * FROM workers WHERE worker_id = $1', [user_id]);
      if (result.rows.length > 0) {
        const worker = result.rows[0];
        if (password === worker.password) {
          return res.status(200).json({
            message: 'Login successful',
            worker_id: worker.worker_id,
            worker_name: worker.worker_name,
            specialization: worker.specialization,
            status: worker.status,
            user_type: 'worker'
          });
        }
      }
    }
    
    // If we get here, authentication failed
    return res.status(401).json({ message: 'Invalid credentials or user not found.' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login', detail: err.message });
  }
});

// --- WORKER AUTHENTICATION ---

app.post('/api/worker/login', async (req, res) => {
  const { worker_id, password } = req.body;
  if (!worker_id || !password) {
    return res.status(400).json({ message: 'Worker ID and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM workers WHERE worker_id = $1', [worker_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    const worker = result.rows[0];

    // Plain text password comparison
    const match = (password === worker.password);

    if (match) {
      res.status(200).json({ 
        message: 'Login successful', 
        worker_id: worker.worker_id, 
        worker_name: worker.worker_name,
        specialization: worker.specialization,
        status: worker.status,
        user_type: 'worker'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Worker Login Error:', err);
    res.status(500).json({ message: 'Server error during login', detail: err.message });
  }
});

// --- VENDOR DASHBOARD ---

app.get('/api/vendor/dashboard/:vendor_id', async (req, res) => {
  const { vendor_id } = req.params;
  try {
    const ordersResult = await pool.query('SELECT * FROM orders WHERE vendor_id = $1', [vendor_id]);
    const orders = ordersResult.rows;

    const categorizedOrders = {
      pending: orders.filter(o => o.status === 'pending'),
      in_process: orders.filter(o => o.status === 'in_process'),
      completed: orders.filter(o => o.status === 'completed'),
    };

    res.status(200).json(categorizedOrders);
  } catch (err) {
    console.error('Dashboard Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching dashboard data', detail: err.message });
  }
});

// --- QR CODE GENERATION ---

app.post('/api/vendor/generate-qr', async (req, res) => {
  const { vendor_id, order_id } = req.body;
  if (!vendor_id || !order_id) {
    return res.status(400).json({ message: 'vendor_id and order_id are required.' });
  }

  const client = await pool.connect();
  try {
    console.log(`[QR_GEN] Starting transaction for order_id: ${order_id}`);
    await client.query('BEGIN');

    console.log('[QR_GEN] 1. Fetching order...');
    const orderRes = await client.query('SELECT * FROM orders WHERE order_id = $1 AND vendor_id = $2', [order_id, vendor_id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found for this vendor.' });
    }
    const order = orderRes.rows[0];
    console.log(`[QR_GEN] Found order: ${order.order_id}, Status: ${order.status}`);

    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Order is already in '${order.status}' state and cannot be processed again.` });
    }

    console.log('[QR_GEN] 2. Finding or creating lot...');
    let lotRes = await client.query('SELECT * FROM lots WHERE order_id = $1 FOR UPDATE', [order_id]);
    let lotId;

    if (lotRes.rows.length > 0) {
      lotId = lotRes.rows[0].lot_id;
      console.log(`[QR_GEN] Found existing lot: ${lotId}`);
    } else {
      console.log('[QR_GEN] No lot found. Creating new lot...');
      const latestLotRes = await client.query('SELECT lot_number FROM lots WHERE vendor_id = $1 ORDER BY lot_number DESC LIMIT 1 FOR UPDATE', [vendor_id]);
      const nextLotNumber = (latestLotRes.rows.length > 0 ? latestLotRes.rows[0].lot_number : 0) + 1;
      lotId = `${vendor_id}-LOT-${nextLotNumber}`;
      console.log(`[QR_GEN] New lotId will be: ${lotId}`);
      await client.query('INSERT INTO lots (lot_id, vendor_id, lot_number, order_id) VALUES ($1, $2, $3, $4)', [lotId, vendor_id, nextLotNumber, order_id]);
      console.log('[QR_GEN] New lot created.');
    }

    console.log(`[QR_GEN] 3. Calculating next batch number for lot: ${lotId}`);
    const batchCountRes = await client.query('SELECT COUNT(*) as batch_count FROM batches WHERE lot_id = $1', [lotId]);
    const nextBatchNumber = parseInt(batchCountRes.rows[0].batch_count) + 1;
    const batchId = `${lotId}-B${nextBatchNumber}`;
    console.log(`[QR_GEN] Next batch number: ${nextBatchNumber}, New batchId: ${batchId}`);
    
    let qrCodes = [];

    if (order.order_type === 'batch_wise') {
      console.log('[QR_GEN] 4. Processing as batch_wise order.');
      const qrData = { type: 'batch', batch_id: batchId, order_id: order.order_id, vendor_id: vendor_id };
      await client.query('INSERT INTO batches (batch_id, lot_id, order_id, batch_number, qr_data) VALUES ($1, $2, $3, $4, $5)', [batchId, lotId, order.order_id, nextBatchNumber, qrData]);
      console.log('[QR_GEN] Inserted into batches.');
      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      qrCodes.push({ id: batchId, url: qrUrl });

    } else if (order.order_type === 'item_wise') {
      console.log('[QR_GEN] 4. Processing as item_wise order.');
      await client.query('INSERT INTO batches (batch_id, lot_id, order_id, batch_number) VALUES ($1, $2, $3, $4)', [batchId, lotId, order.order_id, nextBatchNumber]);
      console.log('[QR_GEN] Inserted into batches for item_wise order.');

      for (let i = 1; i <= order.quantity; i++) {
        const fittingId = `${batchId}-ITEM-${i}`;
        const qrData = { type: 'item', fitting_id: fittingId, batch_id: batchId, order_id: order.order_id, vendor_id: vendor_id };
        console.log(`[QR_GEN] Inserting fitting ${i} of ${order.quantity}: ${fittingId}`);
        await client.query('INSERT INTO fittings (fitting_id, item_number, batch_id) VALUES ($1, $2, $3)', [fittingId, i, batchId]);
      }
      console.log('[QR_GEN] Finished inserting fittings.');
    }

    console.log('[QR_GEN] 5. Updating order status to in_process...');
    await client.query('UPDATE orders SET status = $1 WHERE order_id = $2', ['in_process', order.order_id]);
    console.log('[QR_GEN] Order status updated.');

    console.log('[QR_GEN] 6. Committing transaction.');
    await client.query('COMMIT');
    res.status(201).json({ message: 'QR Codes generated successfully', qr_codes: qrCodes });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('QR Generation Error:', err);
    res.status(500).json({ message: 'Error generating QR codes', detail: err.message });
  } finally {
    client.release();
  }
});

// --- STATUS UPDATE ---

app.post('/api/vendor/mark-printed', async (req, res) => {
    const { batch_id, fitting_id } = req.body;
    if (!batch_id && !fitting_id) {
        return res.status(400).json({ message: 'Either batch_id or fitting_id is required.' });
    }

    try {
        if (fitting_id) {
            const result = await pool.query(
                'UPDATE fittings SET status = $1 WHERE fitting_id = $2 RETURNING fitting_id',
                ['printed', fitting_id]
            );
            if (result.rowCount === 0) return res.status(404).json({ message: 'Fitting not found.' });
        } else if (batch_id) {
            const result = await pool.query(
                'UPDATE batches SET is_qr_printed = TRUE, printed_at = CURRENT_TIMESTAMP WHERE batch_id = $1 RETURNING batch_id',
                [batch_id]
            );
            if (result.rowCount === 0) return res.status(404).json({ message: 'Batch not found.' });
        }
        res.status(200).json({ message: 'Status updated to printed.' });
    } catch (err) {
        console.error('Mark Printed Error:', err);
        res.status(500).json({ message: 'Error updating status', detail: err.message });
    }
});


// --- RETRIEVE QR CODES FOR AN ORDER ---
app.get('/api/vendor/order/:order_id/qrcodes', async (req, res) => {
  const { order_id } = req.params;

  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE order_id = $1', [order_id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const order = orderRes.rows[0];

    // Fetch ALL batches for the order
    const allBatchesRes = await pool.query('SELECT * FROM batches WHERE order_id = $1', [order_id]);
    if (allBatchesRes.rows.length === 0) {
      return res.status(200).json({ qr_codes: [] });
    }

    let qrCodes = [];
    // Loop through every batch associated with the order
    for (const batch of allBatchesRes.rows) {
      if (order.order_type === 'batch_wise') {
        const qrData = batch.qr_data;
        if (qrData) {
          const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData));
          qrCodes.push({ id: batch.batch_id, url: qrUrl });
        }
      } else if (order.order_type === 'item_wise') {
        // Find all fittings for the current batch
        const fittingsRes = await pool.query('SELECT * FROM fittings WHERE batch_id = $1', [batch.batch_id]);
        for (const fitting of fittingsRes.rows) {
          // Reconstruct the QR data for each fitting
          const qrData = { type: 'item', fitting_id: fitting.fitting_id, batch_id: batch.batch_id, order_id: order.order_id, vendor_id: order.vendor_id };
          const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData));
          qrCodes.push({ id: fitting.fitting_id, url: qrUrl });
        }
      }
    }

    res.status(200).json({ qr_codes: qrCodes });
  } catch (err) {
    console.error('Error fetching QR codes:', err);
    res.status(500).json({ message: 'Error fetching QR codes', detail: err.message });
  }
});

// --- COMPLETE ORDER (FOR DEMO) ---
app.post('/api/vendor/order/:order_id/complete', async (req, res) => {
  const { order_id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 AND status = $3 RETURNING order_id',
      ['completed', order_id, 'in_process']
    );

    if (result.rowCount === 0) {
      // This could be because the order was not found, or it was not 'in_process'
      const orderCheck = await pool.query('SELECT status FROM orders WHERE order_id = $1', [order_id]);
      if (orderCheck.rowCount === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      if (orderCheck.rows[0].status !== 'in_process') {
        return res.status(400).json({ message: `Order is already in '${orderCheck.rows[0].status}' state.` });
      }
    }

    res.status(200).json({ message: 'Order marked as completed.' });
  } catch (err) {
    console.error('Error completing order:', err);
    res.status(500).json({ message: 'Error completing order', detail: err.message });
  }
});


// --- OFFICER DASHBOARD ---

app.get('/api/officer/dashboard/:officer_id', async (req, res) => {
  const { officer_id } = req.params;
  try {
    // Get all vendors
    const vendorsResult = await pool.query('SELECT * FROM vendors');
    const vendors = vendorsResult.rows;

    // Get all orders
    const ordersResult = await pool.query('SELECT o.*, v.vendor_name FROM orders o JOIN vendors v ON o.vendor_id = v.vendor_id');
    const orders = ordersResult.rows;

    // Get maintenance records assigned to this officer
    const maintenanceResult = await pool.query(
      'SELECT m.*, f.fitting_id, f.batch_id FROM maintenance_records m JOIN fittings f ON m.fitting_id = f.fitting_id WHERE m.officer_id = $1',
      [officer_id]
    );
    const maintenanceRecords = maintenanceResult.rows;

    res.status(200).json({
      vendors,
      orders,
      maintenanceRecords
    });
  } catch (err) {
    console.error('Officer Dashboard Fetch Error:', err);
    res.status(500).json({ message: 'Error fetching dashboard data', detail: err.message });
  }
});

// --- QR CODE SCANNING ---

app.post('/api/scan-qr', async (req, res) => {
  const { qr_data } = req.body;
  if (!qr_data) {
    return res.status(400).json({ message: 'QR data is required.' });
  }

  try {
    const data = JSON.parse(qr_data);
    let result;

    if (data.type === 'batch') {
      // Get batch details
      const batchRes = await pool.query('SELECT * FROM batches WHERE batch_id = $1', [data.batch_id]);
      if (batchRes.rows.length === 0) {
        return res.status(404).json({ message: 'Batch not found.' });
      }
      const batch = batchRes.rows[0];

      // Get order details
      const orderRes = await pool.query('SELECT * FROM orders WHERE order_id = $1', [data.order_id]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      const order = orderRes.rows[0];

      // Get vendor details
      const vendorRes = await pool.query('SELECT * FROM vendors WHERE vendor_id = $1', [data.vendor_id]);
      if (vendorRes.rows.length === 0) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }
      const vendor = vendorRes.rows[0];

      result = {
        type: 'batch',
        batch_id: batch.batch_id,
        order_id: order.order_id,
        order_status: order.status,
        component_type: order.component_type,
        vendor_name: vendor.vendor_name,
        vendor_id: vendor.vendor_id
      };
    } else if (data.type === 'item') {
      // Get fitting details
      const fittingRes = await pool.query('SELECT * FROM fittings WHERE fitting_id = $1', [data.fitting_id]);
      if (fittingRes.rows.length === 0) {
        return res.status(404).json({ message: 'Fitting not found.' });
      }
      const fitting = fittingRes.rows[0];

      // Get batch details
      const batchRes = await pool.query('SELECT * FROM batches WHERE batch_id = $1', [data.batch_id]);
      if (batchRes.rows.length === 0) {
        return res.status(404).json({ message: 'Batch not found.' });
      }
      const batch = batchRes.rows[0];

      // Get order details
      const orderRes = await pool.query('SELECT * FROM orders WHERE order_id = $1', [data.order_id]);
      if (orderRes.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      const order = orderRes.rows[0];

      // Get vendor details
      const vendorRes = await pool.query('SELECT * FROM vendors WHERE vendor_id = $1', [data.vendor_id]);
      if (vendorRes.rows.length === 0) {
        return res.status(404).json({ message: 'Vendor not found.' });
      }
      const vendor = vendorRes.rows[0];

      // Get installation records if any
      const installationRes = await pool.query('SELECT * FROM installation_records WHERE fitting_id = $1', [data.fitting_id]);
      const installationRecord = installationRes.rows.length > 0 ? installationRes.rows[0] : null;

      // Get maintenance records if any
      const maintenanceRes = await pool.query('SELECT * FROM maintenance_records WHERE fitting_id = $1', [data.fitting_id]);
      const maintenanceRecords = maintenanceRes.rows;

      result = {
        type: 'item',
        fitting_id: fitting.fitting_id,
        item_number: fitting.item_number,
        status: fitting.status,
        batch_id: batch.batch_id,
        order_id: order.order_id,
        order_status: order.status,
        component_type: order.component_type,
        vendor_name: vendor.vendor_name,
        vendor_id: vendor.vendor_id,
        installation: installationRecord,
        maintenance: maintenanceRecords
      };
    } else {
      return res.status(400).json({ message: 'Invalid QR code type.' });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('QR Scan Error:', err);
    res.status(500).json({ message: 'Error processing QR code', detail: err.message });
  }
});

// --- INSTALLATION RECORD ---

app.post('/api/worker/installation', async (req, res) => {
  const { fitting_id, worker_id, location_lat, location_long, notes } = req.body;
  if (!fitting_id || !worker_id) {
    return res.status(400).json({ message: 'Fitting ID and Worker ID are required.' });
  }

  try {
    const recordId = `IR-${Date.now()}`;
    await pool.query(
      'INSERT INTO installation_records (record_id, fitting_id, worker_id, location_lat, location_long, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [recordId, fitting_id, worker_id, location_lat, location_long, notes]
    );

    // Update fitting status
    await pool.query('UPDATE fittings SET status = $1 WHERE fitting_id = $2', ['installed', fitting_id]);

    res.status(201).json({ message: 'Installation record created successfully', record_id: recordId });
  } catch (err) {
    console.error('Installation Record Error:', err);
    res.status(500).json({ message: 'Error creating installation record', detail: err.message });
  }
});

// --- MAINTENANCE RECORD ---

app.post('/api/officer/maintenance', async (req, res) => {
  const { fitting_id, officer_id, issue_description } = req.body;
  if (!fitting_id || !officer_id || !issue_description) {
    return res.status(400).json({ message: 'Fitting ID, Officer ID, and Issue Description are required.' });
  }

  try {
    const recordId = `MR-${Date.now()}`;
    await pool.query(
      'INSERT INTO maintenance_records (record_id, fitting_id, officer_id, issue_description) VALUES ($1, $2, $3, $4)',
      [recordId, fitting_id, officer_id, issue_description]
    );

    res.status(201).json({ message: 'Maintenance record created successfully', record_id: recordId });
  } catch (err) {
    console.error('Maintenance Record Error:', err);
    res.status(500).json({ message: 'Error creating maintenance record', detail: err.message });
  }
});

// --- WORKER MAINTENANCE RECORD ---

app.post('/api/worker/maintenance', async (req, res) => {
  const { fitting_id, worker_id, issue_description } = req.body;
  if (!fitting_id || !worker_id || !issue_description) {
    return res.status(400).json({ message: 'Fitting ID, Worker ID, and Issue Description are required.' });
  }

  try {
    const recordId = `MR-${Date.now()}`;
    // Using worker_id in place of officer_id
    await pool.query(
      'INSERT INTO maintenance_records (record_id, fitting_id, officer_id, issue_description) VALUES ($1, $2, $3, $4)',
      [recordId, fitting_id, worker_id, issue_description]
    );

    res.status(201).json({ message: 'Maintenance record created successfully', record_id: recordId });
  } catch (err) {
    console.error('Maintenance Record Error:', err);
    res.status(500).json({ message: 'Error creating maintenance record', detail: err.message });
  }
});

// --- FILE UPLOAD ---

app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { related_id, file_type, uploaded_by } = req.body;
  if (!related_id || !file_type || !uploaded_by) {
    return res.status(400).json({ message: 'Related ID, File Type, and Uploader ID are required.' });
  }

  try {
    // Upload file to Google Drive
    const fileMetadata = {
      name: req.file.originalname,
      parents: ['YOUR_GOOGLE_DRIVE_FOLDER_ID'], // Replace with your folder ID
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    // This is a placeholder for the actual Google Drive API call
    // In a real implementation, you would use the drive.files.create method
    // const driveResponse = await drive.files.create({
    //   resource: fileMetadata,
    //   media: media,
    //   fields: 'id,webViewLink',
    // });

    // For demo purposes, we'll create a mock response
    const driveResponse = {
      data: {
        id: `file-${Date.now()}`,
        webViewLink: `https://drive.google.com/file/d/mock-file-id/view`,
      },
    };

    // Save file reference in database
    const fileId = `F-${Date.now()}`;
    await pool.query(
      'INSERT INTO files (file_id, related_id, file_type, file_name, file_url, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6)',
      [fileId, related_id, file_type, req.file.originalname, driveResponse.data.webViewLink, uploaded_by]
    );

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'File uploaded successfully',
      file_id: fileId,
      file_url: driveResponse.data.webViewLink,
    });
  } catch (err) {
    console.error('File Upload Error:', err);
    // Clean up the temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading file', detail: err.message });
  }
});

// --- SERVER START ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});