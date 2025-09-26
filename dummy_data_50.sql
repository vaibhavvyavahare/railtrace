-- Dummy data generator for Postgres
-- Generates 50 rows for each table with consistent foreign keys
-- Assumes schema in `database.sql` is already applied

-- VENDORS (V-101 .. V-150)
INSERT INTO vendors (vendor_id, vendor_name, password, email, phone, address)
SELECT
  format('V-%03s', n) AS vendor_id,
  format('Vendor %s', n) AS vendor_name,
  '123' AS password,
  format('vendor%1$s@example.com', n) AS email,
  format('+1-555-%04s', n) AS phone,
  format('%1$s Market Street, City %1$s', n) AS address
FROM generate_series(101, 150) AS s(n);

-- OFFICERS (O-101 .. O-150)
INSERT INTO officers (officer_id, officer_name, password, email, phone, department, role)
SELECT
  format('O-%03s', n) AS officer_id,
  format('Officer %s', n) AS officer_name,
  '123' AS password,
  format('officer%1$s@railways.gov', n) AS email,
  format('+1-666-%04s', n) AS phone,
  CASE WHEN (n % 2) = 0 THEN 'Operations' ELSE 'Quality Control' END AS department,
  CASE WHEN (n % 3) = 0 THEN 'Manager' ELSE 'Inspector' END AS role
FROM generate_series(101, 150) AS s(n);

-- WORKERS (W-101 .. W-150)
INSERT INTO workers (worker_id, worker_name, password, email, phone, specialization, status)
SELECT
  format('W-%03s', n) AS worker_id,
  format('Worker %s', n) AS worker_name,
  '123' AS password,
  format('worker%1$s@railways.gov', n) AS email,
  format('+1-777-%04s', n) AS phone,
  CASE
    WHEN (n % 3) = 0 THEN 'Signal Systems'
    WHEN (n % 3) = 1 THEN 'Track Installation'
    ELSE 'Electrical'
  END AS specialization,
  CASE WHEN (n % 5) = 0 THEN 'on_leave' ELSE 'available' END AS status
FROM generate_series(101, 150) AS s(n);

-- ORDERS (ORD-101 .. ORD-150), mapped to vendors V-101..V-150
INSERT INTO orders (order_id, vendor_id, component_type, quantity, status, order_type)
SELECT
  format('ORD-%03s', n) AS order_id,
  format('V-%03s', n) AS vendor_id,
  CASE
    WHEN (n % 5) = 0 THEN 'Fish Plates'
    WHEN (n % 5) = 1 THEN 'Elastic Rail Clips'
    WHEN (n % 5) = 2 THEN 'Sleepers'
    WHEN (n % 5) = 3 THEN 'Standard Bolts'
    ELSE 'Special Liners'
  END AS component_type,
  10 + (n % 50) AS quantity,
  CASE
    WHEN (n % 4) = 0 THEN 'pending'
    WHEN (n % 4) = 1 THEN 'in_process'
    ELSE 'completed'
  END AS status,
  CASE WHEN (n % 2) = 0 THEN 'batch_wise' ELSE 'item_wise' END AS order_type
FROM generate_series(101, 150) AS s(n);

-- LOTS (LOT-101 .. LOT-150), one per order/vendor, unique (vendor_id, lot_number)
INSERT INTO lots (lot_id, vendor_id, order_id, lot_number, created_at)
SELECT
  format('LOT-%03s', n) AS lot_id,
  format('V-%03s', n) AS vendor_id,
  format('ORD-%03s', n) AS order_id,
  (n - 100) AS lot_number,
  NOW() - ((150 - n) || ' hours')::interval AS created_at
FROM generate_series(101, 150) AS s(n);

-- BATCHES (B-101 .. B-150), one per lot, unique (lot_id, batch_number)
INSERT INTO batches (batch_id, lot_id, order_id, batch_number, qr_data, is_qr_printed, printed_at)
SELECT
  format('B-%03s', n) AS batch_id,
  format('LOT-%03s', n) AS lot_id,
  format('ORD-%03s', n) AS order_id,
  1 AS batch_number,
  jsonb_build_object(
    'batch_id', format('B-%03s', n),
    'lot_id', format('LOT-%03s', n),
    'order_id', format('ORD-%03s', n),
    'serial', n
  ) AS qr_data,
  (n % 2) = 0 AS is_qr_printed,
  CASE WHEN (n % 2) = 0 THEN NOW() - ((150 - n) || ' hours')::interval ELSE NULL END AS printed_at
FROM generate_series(101, 150) AS s(n);

-- FITTINGS (FIT-101 .. FIT-150), one per batch
INSERT INTO fittings (fitting_id, item_number, batch_id, status, last_inspection)
SELECT
  format('FIT-%03s', n) AS fitting_id,
  (n - 100) AS item_number,
  format('B-%03s', n) AS batch_id,
  CASE
    WHEN (n % 3) = 0 THEN 'inspected'
    WHEN (n % 3) = 1 THEN 'new'
    ELSE 'printed'
  END AS status,
  CURRENT_DATE - ((n % 30) || ' days')::interval AS last_inspection
FROM generate_series(101, 150) AS s(n);

-- WORKER ASSIGNMENTS (ASG-101 .. ASG-150)
INSERT INTO worker_assignments (assignment_id, worker_id, order_id, assigned_at, status)
SELECT
  format('ASG-%03s', n) AS assignment_id,
  format('W-%03s', n) AS worker_id,
  format('ORD-%03s', n) AS order_id,
  NOW() - ((150 - n) || ' hours')::interval AS assigned_at,
  CASE
    WHEN (n % 3) = 0 THEN 'completed'
    WHEN (n % 3) = 1 THEN 'assigned'
    ELSE 'in_progress'
  END AS status
FROM generate_series(101, 150) AS s(n);

-- INSTALLATION RECORDS (INST-101 .. INST-150)
INSERT INTO installation_records (record_id, fitting_id, worker_id, installed_at, location_lat, location_long, status, notes)
SELECT
  format('INST-%03s', n) AS record_id,
  format('FIT-%03s', n) AS fitting_id,
  format('W-%03s', n) AS worker_id,
  NOW() - ((n % 72) || ' hours')::interval AS installed_at,
  12.900000 + (n::decimal / 1000.0) AS location_lat,
  77.500000 + (n::decimal / 1000.0) AS location_long,
  'installed' AS status,
  format('Installed by worker %1$s on fitting %1$s', n) AS notes
FROM generate_series(101, 150) AS s(n);

-- MAINTENANCE RECORDS (MAIN-101 .. MAIN-150)
INSERT INTO maintenance_records (record_id, fitting_id, officer_id, reported_at, issue_description, status, resolved_at, resolution_notes)
SELECT
  format('MAIN-%03s', n) AS record_id,
  format('FIT-%03s', n) AS fitting_id,
  format('O-%03s', n) AS officer_id,
  NOW() - ((n % 96) || ' hours')::interval AS reported_at,
  CASE WHEN (n % 4) = 0 THEN 'Loose bolt'
       WHEN (n % 4) = 1 THEN 'Wear and tear'
       WHEN (n % 4) = 2 THEN 'Alignment issue'
       ELSE 'Crack observed' END AS issue_description,
  CASE WHEN (n % 3) = 0 THEN 'resolved'
       WHEN (n % 3) = 1 THEN 'reported'
       ELSE 'in_progress' END AS status,
  CASE WHEN (n % 3) = 0 THEN NOW() - ((n % 48) || ' hours')::interval ELSE NULL END AS resolved_at,
  CASE WHEN (n % 3) = 0 THEN 'Issue addressed and verified.' ELSE NULL END AS resolution_notes
FROM generate_series(101, 150) AS s(n);

-- FILES (FILE-101 .. FILE-150) related to orders
INSERT INTO files (file_id, related_id, file_type, file_name, file_url, uploaded_by, uploaded_at)
SELECT
  format('FILE-%03s', n) AS file_id,
  format('ORD-%03s', n) AS related_id,
  CASE WHEN (n % 2) = 0 THEN 'test_report' ELSE 'inspection_report' END AS file_type,
  format('report_%1$s.pdf', n) AS file_name,
  format('https://drive.google.com/file/d/%1$s', n) AS file_url,
  format('O-%03s', n) AS uploaded_by,
  NOW() - ((n % 120) || ' hours')::interval AS uploaded_at
FROM generate_series(101, 150) AS s(n);


