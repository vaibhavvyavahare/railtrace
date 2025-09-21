import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/api';

// --- COMPONENTS ---

const LoginComponent = ({ setVendor }) => {
  const [vendorId, setVendorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/vendor/login`, { vendor_id: vendorId, password });
      setVendor(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check server connection.';
      setError(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="login-container card">
      <div className="card-body">
        <h2 className="card-title">Vendor Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label>Vendor ID</label>
            <input type="text" value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="form-control" placeholder="e.g., V-001" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" placeholder="e.g., password123" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardComponent = ({ vendor, setVendor }) => {
  const [orders, setOrders] = useState({ pending: [], in_process: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!vendor || !vendor.vendor_id) {
        setLoading(false);
        return; // Don't fetch if vendor_id is missing, wait for correct state
      }
      try {
        const response = await axios.get(`${API_URL}/vendor/dashboard/${vendor.vendor_id}`);
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [vendor]);

  const handleGenerateQr = async (orderId) => {
    try {
        const response = await axios.post(`${API_URL}/vendor/generate-qr`, { vendor_id: vendor.vendor_id, order_id: orderId });
        setQrCodes(response.data.qr_codes);
        // Refresh dashboard data
        const refresh = await axios.get(`${API_URL}/vendor/dashboard/${vendor.vendor_id}`);
        setOrders(refresh.data);
    } catch (err) {
        setError('Failed to generate QR codes.');
    }
  };

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {vendor.vendor_name}</h2>
        <button className="btn btn-secondary" onClick={() => setVendor(null)}>Logout</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {qrCodes.length > 0 && (
        <div className="card qr-modal">
            <div className="card-body">
                <div className="qr-header">
                    <h4>Generated QR Codes</h4>
                    <button className="btn-close" onClick={() => setQrCodes([])}>&times;</button>
                </div>
                <div className="qr-grid">
                    {qrCodes.map(qr => (
                        <div key={qr.id} className="qr-item">
                            <img src={qr.url} alt={qr.id} />
                            <span>{qr.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="orders-grid">
        <OrderColumn title="Pending" orders={orders.pending} onGenerate={handleGenerateQr} />
        <OrderColumn title="In Process" orders={orders.in_process} />
        <OrderColumn title="Completed" orders={orders.completed} />
      </div>
    </div>
  );
};

const OrderColumn = ({ title, orders, onGenerate }) => (
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
            {onGenerate && <button className="btn btn-sm btn-primary" onClick={() => onGenerate(order.order_id)}>Generate QR</button>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN APP ---

function App() {
  const [vendor, setVendor] = useState(null);

  return (
    <div className="App">
      <header>
        <h1>Railrtrace</h1>
      </header>
      <main>
        {!vendor ? <LoginComponent setVendor={setVendor} /> : <DashboardComponent vendor={vendor} setVendor={setVendor} />}
      </main>
    </div>
  );
}

export default App;
