import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const OfficerVendors = () => {
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
      }
      setLoading(false);
    };

    fetchVendors();
  }, []);

  if (loading) return <div>Loading Vendors...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="officer-vendors-container">
      <h2>All Vendors</h2>
      {vendors.length === 0 ? (
        <p>No vendors found.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.vendor_id}>
                <td>{vendor.vendor_id}</td>
                <td>{vendor.vendor_name}</td>
                <td>{vendor.email}</td>
                <td>{vendor.phone}</td>
                <td>{vendor.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OfficerVendors;
