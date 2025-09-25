// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import './Login.css'; // Use the CSS with the desired header/footer styles

const Layout = () => {
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
            <main className="main-content">
                <Outlet />
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

export default Layout;