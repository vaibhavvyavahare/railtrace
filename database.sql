-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS maintenance_records;
DROP TABLE IF EXISTS installation_records;
DROP TABLE IF EXISTS worker_assignments;
DROP TABLE IF EXISTS workers;
DROP TABLE IF EXISTS officers;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS fittings;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS lots;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS vendors;

-- Create the vendors table with a password field
CREATE TABLE vendors (
    vendor_id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT
);

-- Create the orders table with an order_type field
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
    component_type VARCHAR(100),
    quantity INT,
    status VARCHAR(50) DEFAULT 'pending', -- Values: 'pending', 'in_process', 'completed'
    order_type VARCHAR(50) -- Values: 'item_wise', 'batch_wise'
);

-- Create the lots table (parent of batches)
CREATE TABLE lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
    order_id VARCHAR(50) REFERENCES orders(order_id),
    lot_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the batches table with a printed_at timestamp
CREATE TABLE batches (
    batch_id VARCHAR(50) PRIMARY KEY,
    lot_id VARCHAR(50) REFERENCES lots(lot_id),
    order_id VARCHAR(50) REFERENCES orders(order_id),
    batch_number INT,
    qr_data JSONB,
    is_qr_printed BOOLEAN DEFAULT FALSE,
    printed_at TIMESTAMP
);

-- Create the fittings table for individual items
CREATE TABLE fittings (
    fitting_id VARCHAR(100) PRIMARY KEY, -- Changed to VARCHAR for unique QR code data
    item_number INT,
    batch_id VARCHAR(50) REFERENCES batches(batch_id),
    status VARCHAR(50) DEFAULT 'new', -- e.g., 'new', 'printed', 'inspected'
    last_inspection DATE
);

-- Add a unique constraint for lot numbers per vendor
ALTER TABLE lots
ADD CONSTRAINT unique_vendor_lot_number UNIQUE (vendor_id, lot_number);

-- Add a unique constraint for batch numbers per lot
ALTER TABLE batches
ADD CONSTRAINT unique_lot_batch_number UNIQUE (lot_id, batch_number);

-- Create officers table
CREATE TABLE officers (
    officer_id VARCHAR(50) PRIMARY KEY,
    officer_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    department VARCHAR(100),
    role VARCHAR(50)
);

-- Create workers table
CREATE TABLE workers (
    worker_id VARCHAR(50) PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    specialization VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available' -- available, assigned, on_leave
);

-- Create worker assignments table
CREATE TABLE worker_assignments (
    assignment_id VARCHAR(50) PRIMARY KEY,
    worker_id VARCHAR(50) REFERENCES workers(worker_id),
    order_id VARCHAR(50) REFERENCES orders(order_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'assigned' -- assigned, in_progress, completed
);

-- Create installation records table
CREATE TABLE installation_records (
    record_id VARCHAR(50) PRIMARY KEY,
    fitting_id VARCHAR(100) REFERENCES fittings(fitting_id),
    worker_id VARCHAR(50) REFERENCES workers(worker_id),
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_lat DECIMAL(10, 8),
    location_long DECIMAL(11, 8),
    status VARCHAR(50) DEFAULT 'installed',
    notes TEXT
);

-- Create maintenance records table
CREATE TABLE maintenance_records (
    record_id VARCHAR(50) PRIMARY KEY,
    fitting_id VARCHAR(100) REFERENCES fittings(fitting_id),
    officer_id VARCHAR(50) REFERENCES officers(officer_id),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issue_description TEXT,
    status VARCHAR(50) DEFAULT 'reported', -- reported, assigned, in_progress, resolved
    resolved_at TIMESTAMP,
    resolution_notes TEXT
);

-- Create files table for storing file references
CREATE TABLE files (
    file_id VARCHAR(50) PRIMARY KEY,
    related_id VARCHAR(100) NOT NULL, -- Can be order_id, fitting_id, etc.
    file_type VARCHAR(50) NOT NULL, -- test_report, inspection_report, etc.
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- Google Drive URL
    uploaded_by VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === MOCK DATA ===

-- Insert sample vendors (password is 'password123')
-- You can generate new hashes in the register endpoint
INSERT INTO vendors (vendor_id, vendor_name, password, email, phone, address) VALUES
('V-001', 'Rail Components Inc.', '123', 'contact@railcomponents.com', '555-1234', '123 Rail Street, Track City'),
('V-002', 'Track Masters LLC', '123', 'info@trackmasters.com', '555-5678', '456 Track Avenue, Rail Town');

-- Insert sample officers
INSERT INTO officers (officer_id, officer_name, password, email, phone, department, role) VALUES
('O-001', 'John Inspector', '123', 'john@railways.gov', '555-9876', 'Quality Control', 'Inspector'),
('O-002', 'Sarah Manager', '123', 'sarah@railways.gov', '555-6543', 'Operations', 'Manager');

-- Insert sample workers
INSERT INTO workers (worker_id, worker_name, password, email, phone, specialization, status) VALUES
('W-001', 'Mike Installer', '123', 'mike@railways.gov', '555-4321', 'Track Installation', 'available'),
('W-002', 'Lisa Technician', '123', 'lisa@railways.gov', '555-8765', 'Signal Systems', 'available');

-- Insert sample orders
INSERT INTO orders (order_id, vendor_id, component_type, quantity, status, order_type) VALUES
('ORD-BW-01', 'V-001', 'Fish Plates', 50, 'pending', 'batch_wise'),
('ORD-IW-01', 'V-001', 'Elastic Rail Clips', 10, 'pending', 'item_wise'),
('ORD-BW-02', 'V-001', 'Sleepers', 200, 'in_process', 'batch_wise'),
('ORD-IW-02', 'V-002', 'Special Liners', 5, 'pending', 'item_wise'),
('ORD-BW-03', 'V-002', 'Standard Bolts', 500, 'completed', 'batch_wise');
