import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

const OfficerFittingDetails = () => {
  const { fittingId } = useParams();
  const [fitting, setFitting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFittingDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/officer/fitting/${fittingId}`);
        setFitting(response.data);
      } catch (err) {
        setError('Failed to fetch fitting details.');
      }
      setLoading(false);
    };

    fetchFittingDetails();
  }, [fittingId]);

  if (loading) return <div>Loading Fitting Details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!fitting) return <div>Fitting not found.</div>;

  return (
    <div className="officer-fitting-details-container">
      <h2>Fitting Details: {fitting.fitting_id}</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">General Information</h5>
          <p><strong>Item Number:</strong> {fitting.item_number}</p>
          <p><strong>Current Status:</strong> {fitting.fitting_status}</p>
          <p><strong>Last Inspection:</strong> {fitting.last_inspection ? new Date(fitting.last_inspection).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title">Manufacturing Details</h5>
          <p><strong>Batch ID:</strong> {fitting.batch_id}</p>
          <p><strong>QR Data:</strong> {JSON.stringify(fitting.qr_data)}</p>
          <p><strong>QR Printed:</strong> {fitting.is_qr_printed ? 'Yes' : 'No'}</p>
          <p><strong>Printed At:</strong> {fitting.printed_at ? new Date(fitting.printed_at).toLocaleString() : 'N/A'}</p>
          <p><strong>Order ID:</strong> {fitting.order_id}</p>
          <p><strong>Component Type:</strong> {fitting.component_type}</p>
          <p><strong>Quantity:</strong> {fitting.quantity}</p>
          <p><strong>Order Status:</strong> {fitting.order_status}</p>
          <p><strong>Order Type:</strong> {fitting.order_type}</p>
          <p><strong>Vendor ID:</strong> {fitting.vendor_id}</p>
          <p><strong>Vendor Name:</strong> {fitting.vendor_name}</p>
        </div>
      </div>

      {fitting.installation_record_id && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Installation Details</h5>
            <p><strong>Record ID:</strong> {fitting.installation_record_id}</p>
            <p><strong>Installed At:</strong> {new Date(fitting.installed_at).toLocaleString()}</p>
            <p><strong>Installer:</strong> {fitting.installer_name} ({fitting.installer_id})</p>
            <p><strong>Location:</strong> Lat: {fitting.location_lat}, Long: {fitting.location_long}</p>
            <p><strong>Notes:</strong> {fitting.installation_notes || 'N/A'}</p>
          </div>
        </div>
      )}

      {fitting.maintenance_records && fitting.maintenance_records.length > 0 && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Maintenance History</h5>
            {fitting.maintenance_records.map(record => (
              <div key={record.record_id} className="mb-2 p-2 border rounded">
                <p><strong>Record ID:</strong> {record.record_id}</p>
                <p><strong>Reported At:</strong> {new Date(record.reported_at).toLocaleString()}</p>
                <p><strong>Officer ID:</strong> {record.officer_id}</p>
                <p><strong>Issue:</strong> {record.issue_description}</p>
                <p><strong>Status:</strong> {record.status}</p>
                {record.resolved_at && <p><strong>Resolved At:</strong> {new Date(record.resolved_at).toLocaleString()}</p>}
                {record.resolution_notes && <p><strong>Resolution Notes:</strong> {record.resolution_notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {fitting.associated_files && fitting.associated_files.length > 0 && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Associated Files</h5>
            <ul>
              {fitting.associated_files.map(file => (
                <li key={file.file_id}>
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                    {file.file_name} ({file.file_type})
                  </a>
                  <span> (Uploaded by: {file.uploaded_by} at {new Date(file.uploaded_at).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerFittingDetails;
