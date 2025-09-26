import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, Package, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { aiAPI, handleAPIError } from '../services/api';

const PerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadPerformanceReport();
  }, []);

  const loadPerformanceReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.getPerformanceReport();
      setReport(response.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusData = (items, statusField) => {
    const statusCounts = {};
    items.forEach(item => {
      const status = item[statusField] || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const getVendorPerformanceData = () => {
    if (!report?.data) return [];
    
    const { vendors, lots, batches, fittings } = report.data;
    return vendors.map(vendor => {
      const vendorLots = lots.filter(lot => lot.vendor_id === vendor.vendor_id);
      const vendorBatches = batches.filter(batch => 
        vendorLots.some(lot => lot.lot_id === batch.lot_id)
      );
      const vendorFittings = fittings.filter(fitting => 
        vendorBatches.some(batch => batch.batch_id === fitting.batch_id)
      );

      return {
        name: vendor.vendor_name,
        lots: vendorLots.length,
        batches: vendorBatches.length,
        fittings: vendorFittings.length
      };
    });
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading performance report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h3>Error Loading Report</h3>
        <p>{error.message}</p>
        <button className="btn btn-primary mt-4" onClick={loadPerformanceReport}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="alert alert-warning">
        <h3>No Data Available</h3>
        <p>Unable to load performance report data.</p>
      </div>
    );
  }

  const { data, aiAnalysis } = report;
  const { vendors, orders, lots, batches, fittings, installations, maintenances } = data;

  const orderStatusData = getStatusData(orders, 'status');
  const installationStatusData = getStatusData(installations, 'status');
  const maintenanceStatusData = getStatusData(maintenances, 'status');
  const vendorPerformanceData = getVendorPerformanceData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Report</h2>
          <p className="text-gray-600">Comprehensive system performance analysis</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={loadPerformanceReport}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-blue-600">{vendors.length}</div>
              <div className="metric-label">Total Vendors</div>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-green-600">{orders.length}</div>
              <div className="metric-label">Total Orders</div>
            </div>
            <Package className="text-green-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-purple-600">{fittings.length}</div>
              <div className="metric-label">Total Fittings</div>
            </div>
            <Activity className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-orange-600">{installations.length}</div>
              <div className="metric-label">Installations</div>
            </div>
            <TrendingUp className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">AI Executive Summary</h3>
          
          {aiAnalysis.executive_summary && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700">{aiAnalysis.executive_summary}</p>
            </div>
          )}

          {aiAnalysis.system_health && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
              <p className="text-gray-700">{aiAnalysis.system_health}</p>
            </div>
          )}

          {aiAnalysis.critical_issues && aiAnalysis.critical_issues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Critical Issues</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {aiAnalysis.critical_issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.action_items && aiAnalysis.action_items.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {aiAnalysis.action_items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Installation Status Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Installation Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={installationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {installationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Performance */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Vendor Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={vendorPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="lots" fill="#3b82f6" name="Lots" />
            <Bar dataKey="batches" fill="#10b981" name="Batches" />
            <Bar dataKey="fittings" fill="#f59e0b" name="Fittings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Maintenance Status */}
      {maintenanceStatusData.length > 0 && (
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Maintenance Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={maintenanceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {maintenanceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Vendor Performance Table */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Vendor Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Vendor</th>
                <th className="text-left py-2">Lots</th>
                <th className="text-left py-2">Batches</th>
                <th className="text-left py-2">Fittings</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => {
                const vendorLots = lots.filter(lot => lot.vendor_id === vendor.vendor_id);
                const vendorBatches = batches.filter(batch => 
                  vendorLots.some(lot => lot.lot_id === batch.lot_id)
                );
                const vendorFittings = fittings.filter(fitting => 
                  vendorBatches.some(batch => batch.batch_id === fitting.batch_id)
                );

                return (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      <div>
                        <div className="font-medium">{vendor.vendor_name}</div>
                        <div className="text-xs text-gray-500">{vendor.vendor_id}</div>
                      </div>
                    </td>
                    <td className="py-2">{vendorLots.length}</td>
                    <td className="py-2">{vendorBatches.length}</td>
                    <td className="py-2">{vendorFittings.length}</td>
                    <td className="py-2">{vendor.email || 'N/A'}</td>
                    <td className="py-2">{vendor.phone || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Raw Report Data</h3>
        <div className="json-viewer">
          {JSON.stringify(report, null, 2)}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
