// src/components/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // This is the only import you need for styles

const API_URL = 'http://localhost:3001/api';

const LoginComponent = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { user_id: userId, password });
            const { user_type } = response.data;
            if (user_type === 'vendor') {
                navigate('/vendor');
            } else if (user_type === 'officer') {
                navigate('/office');
            } else {
                setError('Unknown user type');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please check server connection.';
            setError(errorMsg);
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <img src="/images/logo.png" alt="RailTrace Logo" className="header-logo" />
                        <div className="title-section">
                            <h1>RailTrace</h1>
                        </div>
                    </div>
                    <nav className="nav">
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                        <a href="#support">Support</a>
                    </nav>
                </div>
            </header>
            <main className="main-content login-bg-train">
                <div className="login-container">
                    <div className="login-info">
                        <div className="info-content">
                            <h2 className="info-title">Secure Railway Asset Management</h2>
                            <p className="info-subtitle">
                                Advanced digital tracking system for Indian Railways infrastructure and rolling stock management.
                            </p>
                            <ul className="features-list">
                                <li>Real-time asset tracking & monitoring</li>
                                <li>QR code-based identification system</li>
                                <li>AI-powered predictive maintenance</li>
                                <li>Comprehensive audit trails</li>
                                <li>Multi-level security protocols</li>
                            </ul>
                        </div>
                    </div>
                    <div className="login-form-section">
                        <div className="form-header">
                            <div className="demo-badge">DEMO VERSION</div>
                            <h2 className="form-title">Authorized Access</h2>
                            <p className="form-subtitle">Please enter your credentials to access the system</p>
                        </div>
                        <form className="login-form" onSubmit={handleLogin}>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="form-group">
                                <label className="form-label" htmlFor="userId">Employee ID / Email Address</label>
                                <input
                                    type="text"
                                    id="userId"
                                    className="form-input"
                                    placeholder="Enter your employee ID or email"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder="Enter your secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Logging in...' : '🔐 Secure Login to RailTrace'}
                            </button>
                            <div className="form-links">
                                <a href="/forgot">Forgot Password?</a>
                                <a href="/register">New Vendor Registration</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-main">
                        <div className="footer-text">
                            © 2025 RailTrace - Digital Railway Asset Tracking System | Powered by AI & QR Technology
                        </div>
                    </div>
                    <div className="footer-disclaimer">
                        This is a demonstration version. All data is for testing purposes only.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginComponent;