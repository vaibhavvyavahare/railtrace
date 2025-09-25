import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

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

  const { items: sortedVendors, requestSort, sortConfig } = useSortableData(vendors);

  const getSortDirection = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? (sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽') : '';
  };

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
                      <th onClick={() => requestSort('vendor_id')} style={{ cursor: 'pointer' }}>
                        Vendor ID{getSortDirection('vendor_id')}
                      </th>
                      <th onClick={() => requestSort('vendor_name')} style={{ cursor: 'pointer' }}>
                        Name{getSortDirection('vendor_name')}
                      </th>
                      <th onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
                        Email{getSortDirection('email')}
                      </th>
                      <th onClick={() => requestSort('phone')} style={{ cursor: 'pointer' }}>
                        Phone{getSortDirection('phone')}
                      </th>
                  </tr>
              </thead>
              <tbody>
                  {sortedVendors.length > 0 ? sortedVendors.map(vendor => (
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