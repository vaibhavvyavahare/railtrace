-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS fittings;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS lots;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS vendors;

-- Create the vendors table with a password field
CREATE TABLE vendors (
    vendor_id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
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
    lot_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the batches table with a printed_at timestamp
CREATE TABLE batches (
    batch_id VARCHAR(50) PRIMARY KEY,
    lot_id VARCHAR(50) REFERENCES lots(lot_id),
    order_id VARCHAR(50) REFERENCES orders(order_id),
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

-- === MOCK DATA ===

-- Insert sample vendors (password is 'password123')
-- You can generate new hashes in the register endpoint
INSERT INTO vendors (vendor_id, vendor_name, password) VALUES
('V-001', 'Rail Components Inc.', '123'),
('V-002', 'Track Masters LLC', '123');

-- Insert sample orders
INSERT INTO orders (order_id, vendor_id, component_type, quantity, status, order_type) VALUES
('ORD-BW-01', 'V-001', 'Fish Plates', 50, 'pending', 'batch_wise'),
('ORD-IW-01', 'V-001', 'Elastic Rail Clips', 10, 'pending', 'item_wise'),
('ORD-BW-02', 'V-001', 'Sleepers', 200, 'in_process', 'batch_wise'),
('ORD-IW-02', 'V-002', 'Special Liners', 5, 'pending', 'item_wise'),
('ORD-BW-03', 'V-002', 'Standard Bolts', 500, 'completed', 'batch_wise');
