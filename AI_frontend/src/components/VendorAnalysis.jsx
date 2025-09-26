import React, { useState } from 'react';
import { Search, RefreshCw, TrendingUp, AlertTriangle, Package, Activity } from 'lucide-react';
import { aiAPI, handleAPIError } from '../services/api';

const VendorAnalysis = () => {
  const [vendorId, setVendorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!vendorId.trim()) {
      setError({ message: 'Please enter a vendor ID' });
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await aiAPI.getVendorSummary(vendorId.trim());
      setAnalysis(response.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    const { data, aiAnalysis } = analysis;
    const { vendor, lots, batches, fittings, installations, maintenances } = data;

    return (
      <div className="space-y-6">
        {/* Vendor Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Vendor Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="metric-value text-blue-600">{lots.length}</div>
              <div className="metric-label">Total Lots</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-green-600">{batches.length}</div>
              <div className="metric-label">Total Batches</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-purple-600">{fittings.length}</div>
              <div className="metric-label">Total Fittings</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-orange-600">{installations.length}</div>
              <div className="metric-label">Installations</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Vendor Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Vendor ID:</span> {vendor.vendor_id}
              </div>
              <div>
                <span className="font-medium">Vendor Name:</span> {vendor.vendor_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {vendor.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {vendor.phone || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
            
            {aiAnalysis.summary && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{aiAnalysis.summary}</p>
              </div>
            )}

            {aiAnalysis.trends && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Performance Trends</h4>
                <p className="text-gray-700">{aiAnalysis.trends}</p>
              </div>
            )}

            {aiAnalysis.risks && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                <p className="text-gray-700">{aiAnalysis.risks}</p>
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

            {aiAnalysis.alerts && aiAnalysis.alerts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Alerts</h4>
                <div className="space-y-2">
                  {aiAnalysis.alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`alert-item ${alert.severity?.toLowerCase() || 'low'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          {alert.action && (
                            <div className="text-sm text-gray-600 mt-1">
                              Action: {alert.action}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity?.toLowerCase() === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : alert.severity?.toLowerCase() === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.severity || 'Low'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Installation Status */}
        {installations.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Installation Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Fitting ID</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Installed At</th>
                    <th className="text-left py-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {installations.slice(0, 10).map((installation, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-mono text-xs">{installation.fitting_id}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          installation.status === 'installed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {installation.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {new Date(installation.installed_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        {installation.location_lat && installation.location_long 
                          ? `${installation.location_lat.toFixed(4)}, ${installation.location_long.toFixed(4)}`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Maintenance Records */}
        {maintenances.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance Records</h3>
            <div className="space-y-3">
              {maintenances.slice(0, 5).map((maintenance, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{maintenance.fitting_id}</div>
                      <div className="text-sm text-gray-600">
                        {maintenance.issue_description}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      maintenance.status === 'resolved' 
                        ? 'bg-green-100 text-green-800'
                        : maintenance.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {maintenance.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Reported: {new Date(maintenance.reported_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Data */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Raw Analysis Data</h3>
          <div className="json-viewer">
            {JSON.stringify(analysis, null, 2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vendor Analysis</h2>
        <p className="text-gray-600">Get AI-powered insights for vendor performance</p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Analyze Vendor</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Vendor ID (e.g., V-001)"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <Search size={16} />
                Analyze
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="alert alert-danger mt-4">
            {error.message}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {renderAnalysis()}
    </div>
  );
};

export default VendorAnalysis;
