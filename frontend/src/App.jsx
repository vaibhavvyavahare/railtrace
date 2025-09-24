import { Routes, Route } from 'react-router-dom';
import LoginComponent from './components/Login';
import VendorDashboard from './components/VendorDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import OfficerVendors from './components/OfficerVendors';
import OfficerOrders from './components/OfficerOrders';
import OfficerFittingDetails from './components/OfficerFittingDetails';
import './App.css';

function App() {
  return (
    <div className="App container py-4">
      <header className="mb-4 text-center">
        <h1>Railtrace</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LoginComponent />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/office" element={<OfficerDashboard />} />
          <Route path="/office/vendors" element={<OfficerVendors />} />
          <Route path="/office/orders" element={<OfficerOrders />} />
          <Route path="/office/fitting/:fittingId" element={<OfficerFittingDetails />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
