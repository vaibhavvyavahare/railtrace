import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState({ pending: [], in_process: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchDashboard = async (vendorId) => {
    try {
      const response = await axios.get(`${API_URL}/vendor/dashboard/${vendorId}`);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    // In a real app, you would get the vendor data from a context or a token
    const vendorData = { vendor_id: 'V-001', vendor_name: 'Test Vendor' };
    setVendor(vendorData);
    fetchDashboard(vendorData.vendor_id);
  }, []);

  const handleGenerateQr = async (orderId) => {
    try {
        const response = await axios.post(`${API_URL}/vendor/generate-qr`, { vendor_id: vendor.vendor_id, order_id: orderId });
        setQrCodes(response.data.qr_codes);
        setSelectedOrderId(orderId);
        fetchDashboard(vendor.vendor_id);
    } catch (err) {
        setError('Failed to generate QR codes.');
    }
  };
  
  const handleShowQrCodes = async (orderId) => {
    try {
        const response = await axios.get(`${API_URL}/vendor/order/${orderId}/qrcodes`);
        setQrCodes(response.data.qr_codes);
        setSelectedOrderId(orderId);
    } catch (err) {
        setError('Failed to retrieve QR codes.');
    }
  };

  const handleComplete = async (orderId) => {
    try {
      await axios.post(`${API_URL}/vendor/order/${orderId}/complete`);
      fetchDashboard(vendor.vendor_id);
    } catch (err) {
      setError('Failed to mark order as complete.');
    }
  };

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {vendor?.vendor_name}</h2>
        {/* In a real app, you would have a proper logout mechanism */}
        <button className="btn btn-secondary" onClick={() => alert('Logged out')}>Logout</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {qrCodes.length > 0 && (
        <div className="card qr-modal">
            <div className="card-body">
                <div className="qr-header">
                    <h4>QR Codes for Order {selectedOrderId}</h4>
                    <button className="btn-close" onClick={() => { setQrCodes([]); setSelectedOrderId(null); }}>&times;</button>
                </div>
                <div className="qr-grid">
                    {qrCodes.map(qr => (
                        <div key={qr.id} className="qr-item">
                            <img src={qr.url} alt={qr.id} />
                            <span>{qr.id}</span>
                            <button className="btn btn-sm btn-secondary" onClick={() => downloadQRCode(qr.url, qr.id)}>Download</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="orders-grid">
        <OrderColumn title="Pending" orders={orders.pending} onGenerate={handleGenerateQr} />
        <OrderColumn title="In Process" orders={orders.in_process} onShowQR={handleShowQrCodes} onComplete={handleComplete} />
        <OrderColumn title="Completed" orders={orders.completed} onShowQR={handleShowQrCodes} />
      </div>
    </div>
  );
};

const OrderColumn = ({ title, orders, onGenerate, onShowQR, onComplete }) => (
  <div className="order-column">
    <h3>{title} ({orders.length})</h3>
    <div className="card-list">
      {orders.length === 0 && <p>No orders.</p>}
      {orders.map(order => (
        <div key={order.order_id} className="card order-card">
          <div className="card-body">
            <div className="order-details">
                <strong>{order.order_id}</strong><br/>
                <span>{order.component_type}</span><br/>
                <span>Type: {order.order_type}</span> | <span>Qty: {order.quantity}</span>
            </div>
            <div className="order-actions">
              {onGenerate && <button className="btn btn-sm btn-primary" onClick={() => onGenerate(order.order_id)}>Generate QR</button>}
              {onShowQR && <button className="btn btn-sm btn-info" style={{ marginRight: '5px' }} onClick={() => onShowQR(order.order_id)}>Show QR Codes</button>}
              {onComplete && <button className="btn btn-sm btn-success" onClick={() => onComplete(order.order_id)}>Complete</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const downloadQRCode = (dataUrl, fileName) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default VendorDashboard;