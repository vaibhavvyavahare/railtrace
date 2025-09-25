import { Routes, Route } from 'react-router-dom';
import LoginComponent from './components/Login';
import VendorDashboard from './components/VendorDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import OfficerVendors from './components/OfficerVendors';
import OfficerOrders from './components/OfficerOrders';
import OfficerFittingDetails from './components/OfficerFittingDetails';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginComponent />} />
      <Route element={<Layout />}>
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/office" element={<OfficerDashboard />} />
        <Route path="/office/vendors" element={<OfficerVendors />} />
        <Route path="/office/orders" element={<OfficerOrders />} />
        <Route path="/office/fitting/:fittingId" element={<OfficerFittingDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
