const express = require('express');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'railtrace_db',
  password: 'YOUR_REAL_PASSWORD', // IMPORTANT: Replace with your actual password
  port: 5432,
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
      res.status(200).json({ message: 'Login successful', vendor_id: vendor.vendor_id, vendor_name: vendor.vendor_name });
    } else {
      console.log(`[Login Failure] Passwords do not match.`);
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Login Error:', err);
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
    await client.query('BEGIN');

    const orderRes = await client.query('SELECT * FROM orders WHERE order_id = $1 AND vendor_id = $2', [order_id, vendor_id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found for this vendor.' });
    }
    const order = orderRes.rows[0];

    const lotRes = await client.query('SELECT lot_number FROM lots WHERE vendor_id = $1 ORDER BY lot_number DESC LIMIT 1', [vendor_id]);
    const nextLotNumber = lotRes.rows.length > 0 ? lotRes.rows[0].lot_number + 1 : 1;
    const lotId = `${vendor_id}-LOT-${nextLotNumber}`;
    await client.query('INSERT INTO lots (lot_id, vendor_id, lot_number) VALUES ($1, $2, $3)', [lotId, vendor_id, nextLotNumber]);

    const batchRes = await client.query('SELECT COUNT(*) as count FROM batches WHERE lot_id = $1', [lotId]);
    const nextBatchNumber = parseInt(batchRes.rows[0].count) + 1;
    const batchId = `${lotId}-B${nextBatchNumber}`;
    
    let qrCodes = [];

    if (order.order_type === 'batch_wise') {
      const qrData = { type: 'batch', batch_id: batchId, order_id: order.order_id, vendor_id: vendor_id };
      await client.query('INSERT INTO batches (batch_id, lot_id, order_id, qr_data) VALUES ($1, $2, $3, $4)', [batchId, lotId, order.order_id, qrData]);
      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      qrCodes.push({ id: batchId, url: qrUrl });

    } else if (order.order_type === 'item_wise') {
      await client.query('INSERT INTO batches (batch_id, lot_id, order_id) VALUES ($1, $2, $3)', [batchId, lotId, order.order_id]);

      for (let i = 1; i <= order.quantity; i++) {
        const fittingId = `${batchId}-ITEM-${i}`;
        const qrData = { type: 'item', fitting_id: fittingId, batch_id: batchId, order_id: order.order_id, vendor_id: vendor_id };
        await client.query('INSERT INTO fittings (fitting_id, item_number, batch_id) VALUES ($1, $2, $3)', [fittingId, i, batchId]);
        const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData));
        qrCodes.push({ id: fittingId, url: qrUrl });
      }
    }

    await client.query('UPDATE orders SET status = $1 WHERE order_id = $2', ['in_process', order.order_id]);

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


// --- SERVER START ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});