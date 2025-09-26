-- Schema for AI_connector: summary reports and maintenance alerts

-- Summary reports by vendor/lot/batch
CREATE TABLE IF NOT EXISTS summary_reports (
  summary_id VARCHAR(100) PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
  lot_id VARCHAR(50) REFERENCES lots(lot_id),
  batch_id VARCHAR(50) REFERENCES batches(batch_id),
  scope VARCHAR(20) NOT NULL, -- vendor | lot | batch
  summary_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_summary_reports_vendor ON summary_reports(vendor_id);
CREATE INDEX IF NOT EXISTS idx_summary_reports_lot ON summary_reports(lot_id);
CREATE INDEX IF NOT EXISTS idx_summary_reports_batch ON summary_reports(batch_id);

-- Maintenance alerts derived by AI/heuristics
CREATE TABLE IF NOT EXISTS maintenance_alerts (
  alert_id VARCHAR(100) PRIMARY KEY,
  vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
  lot_id VARCHAR(50) REFERENCES lots(lot_id),
  batch_id VARCHAR(50) REFERENCES batches(batch_id),
  fitting_id VARCHAR(100) REFERENCES fittings(fitting_id),
  alert_type VARCHAR(50) NOT NULL, -- inspection_due, damage_suspected, anomaly
  severity VARCHAR(20) NOT NULL, -- low, medium, high
  description TEXT,
  status VARCHAR(20) DEFAULT 'open', -- open, acknowledged, resolved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_vendor ON maintenance_alerts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_fitting ON maintenance_alerts(fitting_id);


