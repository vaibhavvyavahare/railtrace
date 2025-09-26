import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Activity,
  Home,
  Users,
  Package,
  Settings
} from 'lucide-react';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import VendorAnalysis from './components/VendorAnalysis';
import BatchAnalysis from './components/BatchAnalysis';
import PerformanceReport from './components/PerformanceReport';
import MaintenanceAlerts from './components/MaintenanceAlerts';
import SystemHealth from './components/SystemHealth';
import TestPage from './components/TestPage';
import { healthAPI } from './services/api';

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/test', label: 'Test Page', icon: Activity },
    { path: '/vendor', label: 'Vendor Analysis', icon: Users },
    { path: '/batch', label: 'Batch Analysis', icon: Package },
    { path: '/performance', label: 'Performance Report', icon: TrendingUp },
    { path: '/alerts', label: 'Maintenance Alerts', icon: AlertTriangle },
    { path: '/health', label: 'System Health', icon: Activity },
  ];

  return (
    <nav className="nav">
      <div className="flex items-center gap-2">
        <BarChart3 size={24} />
        <span className="text-xl font-bold">RailTrace AI Analytics</span>
      </div>
      <ul className="nav-links">
        {navItems.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <Link 
              to={path} 
              className={location.pathname === path ? 'active' : ''}
            >
              <Icon size={16} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Navigation />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI-Powered Analytics</h1>
            <p className="text-lg opacity-90">
              Intelligent insights for railway component tracking and maintenance
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Header />
          <main className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/vendor" element={<VendorAnalysis />} />
              <Route path="/batch" element={<BatchAnalysis />} />
              <Route path="/performance" element={<PerformanceReport />} />
              <Route path="/alerts" element={<MaintenanceAlerts />} />
              <Route path="/health" element={<SystemHealth />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
