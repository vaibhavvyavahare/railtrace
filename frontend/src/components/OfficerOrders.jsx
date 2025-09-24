import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const OfficerOrders = () => {
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
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading Orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="officer-orders-container">
      <h2>All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Vendor Name</th>
              <th>Component Type</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Order Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.vendor_name}</td>
                <td>{order.component_type}</td>
                <td>{order.quantity}</td>
                <td>{order.status}</td>
                <td>{order.order_type}</td>
                <td>
                  {order.status === 'completed' && (
                    <button className="btn btn-primary btn-sm">Add Report</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OfficerOrders;
