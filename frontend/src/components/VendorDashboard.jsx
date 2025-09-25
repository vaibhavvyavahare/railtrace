import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VendorDashboard.css';
import QRCode from "react-qr-code";

const API_URL = 'http://localhost:3001/api';

const priorityColors = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#10b981'
};

const VendorDashboard = () => {
    const [vendor, setVendor] = useState(null);
    const [orders, setOrders] = useState({ pending: [], in_process: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qrCodes, setQrCodes] = useState([]);
    const [currentStatus, setCurrentStatus] = useState('pending');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

    const navigate = useNavigate();

    const fetchDashboard = async (vendorId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/vendor/dashboard/${vendorId}`);
            setOrders(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch dashboard data. Please try again later.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const vendorData = { vendor_id: 'V-001', vendor_name: 'Railway Components Ltd' };
        setVendor(vendorData);
        fetchDashboard(vendorData.vendor_id);
    }, []);

    const handleGenerateQrAndMove = async (orderId) => {
        try {
            await axios.post(`${API_URL}/vendor/generate-qr`, { vendor_id: vendor.vendor_id, order_id: orderId });
            fetchDashboard(vendor.vendor_id);
        } catch (err) {
            setError('Failed to generate QR codes.');
        }
    };

    const handleShowQrCodes = async (order) => {
        try {
            const response = await axios.get(`${API_URL}/vendor/order/${order.order_id}/qrcodes`);
            setQrCodes(response.data.qr_codes);
            setSelectedOrderForModal(order);
            setShowModal(true);
        } catch (err) {
            setError('Failed to retrieve QR codes.');
        }
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            await axios.post(`${API_URL}/vendor/order/${orderId}/complete`);
            fetchDashboard(vendor.vendor_id);
        } catch (err) {
            setError('Failed to mark order as complete.');
        }
    };

    const handleDownloadQR = (qrUrl, fileName) => {
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrderForModal(null);
        setQrCodes([]);
    };

    const ordersToDisplay = orders[currentStatus] || [];
    const orderCounts = {
        pending: orders.pending.length,
        'in_process': orders.in_process.length,
        completed: orders.completed.length
    };

    if (loading) {
        return <div className="loading-container">Loading Dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="header">
                <div className="welcome-section">
                    <h1>Welcome, {vendor?.vendor_name || 'Vendor'}!</h1>
                    <p>Manage your orders and track component deliveries</p>
                </div>
                <div className="header-actions">
                    <button className="header-btn btn-profile">
                        <span>👤</span>
                        <span>Profile</span>
                    </button>
                    <button className="header-btn btn-logout" onClick={() => navigate('/')}>
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                {error && <div className="error-banner">{error}</div>}
                <div className="status-tabs">
                    <button
                        className={`status-tab ${currentStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setCurrentStatus('pending')}
                    >
                        <span>⏳ Pending</span>
                        <span className="tab-count">{orderCounts.pending}</span>
                    </button>
                    <button
                        className={`status-tab ${currentStatus === 'in_process' ? 'active' : ''}`}
                        onClick={() => setCurrentStatus('in_process')}
                    >
                        <span>🔄 In Process</span>
                        <span className="tab-count">{orderCounts.in_process}</span>
                    </button>
                    <button
                        className={`status-tab ${currentStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => setCurrentStatus('completed')}
                    >
                        <span>✅ Completed</span>
                        <span className="tab-count">{orderCounts.completed}</span>
                    </button>
                </div>

                <div className="orders-grid">
                    {ordersToDisplay.length === 0 ? (
                        <p className="no-orders-message">No orders to display in this category.</p>
                    ) : (
                        ordersToDisplay.map(order => (
                            <div key={order.order_id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id">{order.order_id}</div>
                                    <div className={`order-status status-${currentStatus}`}>
                                        {currentStatus.replace('_', ' ').toUpperCase()}
                                    </div>
                                </div>
                                <div className="order-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Component:</span>
                                        <span className="detail-value">{order.component_type}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Quantity:</span>
                                        <span className="detail-value">{order.quantity}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Order Type:</span>
                                        <span className="detail-value">{order.order_type}</span>
                                    </div>
                                </div>
                                <div className="order-actions">
                                    {currentStatus === 'pending' && (
                                        <button
                                            className="action-btn btn-primary"
                                            onClick={() => handleGenerateQrAndMove(order.order_id)}
                                        >
                                            Generate QR & Start Process
                                        </button>
                                    )}
                                    {currentStatus === 'in_process' && (
                                        <>
                                            <button
                                                className="action-btn btn-secondary"
                                                onClick={() => handleShowQrCodes(order)}
                                            >
                                                Show QR Codes
                                            </button>
                                            <button
                                                className="action-btn btn-primary"
                                                onClick={() => handleCompleteOrder(order.order_id)}
                                            >
                                                Mark as Completed
                                            </button>
                                        </>
                                    )}
                                    {currentStatus === 'completed' && (
                                        <button
                                            className="action-btn btn-secondary"
                                            onClick={() => handleShowQrCodes(order)}
                                        >
                                            Show QR Codes
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && selectedOrderForModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">QR Codes for Order {selectedOrderForModal.order_id}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
                        </div>
                        <div className="qr-grid">
                            {qrCodes.length > 0 ? qrCodes.map(qr => (
                                <div key={qr.id} className="qr-item">
                                    <div className="qr-code-img-container">
                                        <img src={qr.url} alt={`QR for ${qr.id}`} />
                                    </div>
                                    <div className="qr-label">{qr.id}</div>
                                    <button
                                        className="download-btn"
                                        onClick={() => handleDownloadQR(qr.url, qr.id)}
                                    >
                                        💾 Download
                                    </button>
                                </div>
                            )) : <p>No QR codes found for this order.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;