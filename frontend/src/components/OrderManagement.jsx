import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const useSortableData = (items, config = []) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.length > 0) {
      sortableItems.sort((a, b) => {
        for (const { key, direction } of sortConfig) {
          if (a[key] < b[key]) {
            return direction === 'ascending' ? -1 : 1;
          }
          if (a[key] > b[key]) {
            return direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key, multi = false, fromDropdown = false) => {
    let newConfig = [...sortConfig];
    const keyIndex = newConfig.findIndex(c => c.key === key);

    if (fromDropdown) {
      // If sorting from dropdown, always make it a single sort
      if (keyIndex !== -1) {
        newConfig[keyIndex].direction = newConfig[keyIndex].direction === 'ascending' ? 'descending' : 'ascending';
        newConfig = [newConfig[keyIndex]];
      } else {
        newConfig = [{ key, direction: 'ascending' }];
      }
    } else if (multi) {
      if (keyIndex !== -1) {
        // Toggle direction if key exists
        newConfig[keyIndex].direction = newConfig[keyIndex].direction === 'ascending' ? 'descending' : 'ascending';
      } else {
        // Add new key to sort config
        newConfig.push({ key, direction: 'ascending' });
      }
    } else {
      if (keyIndex !== -1) {
        // Just toggle direction
        newConfig[keyIndex].direction = newConfig[keyIndex].direction === 'ascending' ? 'descending' : 'ascending';
        // If not multi-sort, it becomes the primary sort key
        newConfig = [newConfig[keyIndex]];
      } else {
        // Set as the only sort key
        newConfig = [{ key, direction: 'ascending' }];
      }
    }
    setSortConfig(newConfig);
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/officer/orders`);
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(orders);

  const getSortDirection = (name) => {
    const config = sortConfig.find(c => c.key === name);
    if (!config) return '';
    const priority = sortConfig.findIndex(c => c.key === name) + 1;
    return config.direction === 'ascending' ? ` 🔼${priority}` : ` 🔽${priority}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_process': return 'bg-warning';
      case 'pending': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const handleAddReport = (orderId) => {
    // Placeholder for file upload functionality
    alert(`This will open a dialog to upload a test report for order: ${orderId}`);
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Order Management</h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-end align-items-center mb-3">
          <div className="input-group w-auto">
            <label className="input-group-text" htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              className="form-select" 
              onChange={(e) => requestSort(e.target.value, false, true)}
              value={sortConfig.length > 0 ? sortConfig[0].key : ''}
            >
              <option value="order_id">Order ID</option>
              <option value="vendor_name">Vendor</option>
              <option value="component_type">Component Type</option>
              <option value="quantity">Quantity</option>
              <option value="status">Status</option>
            </select>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => requestSort(sortConfig.length > 0 ? sortConfig[0].key : 'order_id', false, true)}
            >
              {sortConfig.length > 0 && sortConfig[0].direction === 'ascending' ? '🔼' : '🔽'}
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
              <thead>
                  <tr>
                      <th onClick={(e) => requestSort('order_id', e.shiftKey)} style={{ cursor: 'pointer' }}>
                        Order ID{getSortDirection('order_id')}
                      </th>
                      <th onClick={(e) => requestSort('vendor_name', e.shiftKey)} style={{ cursor: 'pointer' }}>
                        Vendor{getSortDirection('vendor_name')}
                      </th>
                      <th onClick={(e) => requestSort('component_type', e.shiftKey)} style={{ cursor: 'pointer' }}>
                        Component Type{getSortDirection('component_type')}
                      </th>
                      <th onClick={(e) => requestSort('quantity', e.shiftKey)} style={{ cursor: 'pointer' }}>
                        Quantity{getSortDirection('quantity')}
                      </th>
                      <th onClick={(e) => requestSort('status', e.shiftKey)} style={{ cursor: 'pointer' }}>
                        Status{getSortDirection('status')}
                      </th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                {sortedOrders.length > 0 ? sortedOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.vendor_name}</td>
                    <td>{order.component_type}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Add Test Report" onClick={() => handleAddReport(order.order_id)}>
                          <i className="bi bi-file-earmark-plus"></i> Add Report
                        </button>
                        <button className="btn btn-sm btn-outline-info me-1" title="View QR Code">
                          <i className="bi bi-qr-code"></i>
                        </button>
                        {order.status === 'in_process' && (
                          <button className="btn btn-sm btn-outline-success" title="Mark as Complete">
                            <i className="bi bi-check-circle"></i>
                          </button>
                        )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center">No orders found.</td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
