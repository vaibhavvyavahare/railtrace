import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the new components
import DashboardOverview from './DashboardOverview';
import VendorManagement from './VendorManagement';
import OrderManagement from './OrderManagement';
import InstalledItems from './InstalledItems';

const OfficerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement the logic to search for the item ID and display its lifecycle details.
    alert(`Searching for item: ${searchTerm}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'vendors':
        return <VendorManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'items':
        return <InstalledItems />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="mb-2 mb-md-0">Officer Dashboard</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Logout</button>
        <div className="fitting-search-section">
          <form onSubmit={handleSearch} className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Scan or Enter Item ID for full lifecycle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Track Item</button>
          </form>
        </div>
      </div>

      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
            Vendor Management
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Order Management
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
            Installed Items & Maintenance
          </button>
        </li>
      </ul>

      <div className="tab-content p-3 border border-top-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default OfficerDashboard;
