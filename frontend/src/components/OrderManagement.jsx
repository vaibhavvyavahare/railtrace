import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

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
        <div className="table-responsive">
          <table className="table table-hover">
              <thead>
                  <tr>
                      <th>Order ID</th>
                      <th>Vendor</th>
                      <th>Component Type</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map(order => (
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
