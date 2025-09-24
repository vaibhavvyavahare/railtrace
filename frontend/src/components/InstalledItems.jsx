import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const InstalledItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/officer/fittings`);
        setItems(response.data);
      } catch (err) {
        setError('Failed to fetch installed items.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  if (loading) return <div>Loading installed items...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Installed Items & Maintenance</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
              <thead>
                  <tr>
                      <th>Item ID</th>
                      <th>Installer Name</th>
                      <th>Install Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map(item => (
                  <tr key={item.fitting_id}>
                    <td>{item.fitting_id}</td>
                    <td>{item.installer_name || 'N/A'}</td>
                    <td>{new Date(item.installed_at).toLocaleDateString()}</td>
                    <td>{item.location_lat && item.location_long ? `${item.location_lat}, ${item.location_long}` : 'N/A'}</td>
                    <td>
                      <span className={`badge bg-success`}>
                        {item.installation_status}
                      </span>
                    </td>
                    <td>
                        <button className="btn btn-sm btn-outline-primary">View/Add Log</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center">No installed items found.</td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstalledItems;