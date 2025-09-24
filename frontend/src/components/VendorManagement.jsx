import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${API_URL}/officer/vendors`);
        setVendors(response.data);
      } catch (err) {
        setError('Failed to fetch vendors.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchVendors();
  }, []);

  if (loading) return <div>Loading vendors...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Vendor Management</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
              <thead>
                  <tr>
                      <th>Vendor ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                  </tr>
              </thead>
              <tbody>
                  {vendors.length > 0 ? vendors.map(vendor => (
                    <tr key={vendor.vendor_id}>
                        <td>{vendor.vendor_id}</td>
                        <td>{vendor.vendor_name}</td>
                        <td>{vendor.email}</td>
                        <td>{vendor.phone}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center">No vendors found.</td>
                    </tr>
                  )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;