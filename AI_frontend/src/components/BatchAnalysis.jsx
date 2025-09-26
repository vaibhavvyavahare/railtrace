import React, { useState } from 'react';
import { Search, RefreshCw, Package, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { aiAPI, handleAPIError } from '../services/api';

const BatchAnalysis = () => {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!batchId.trim()) {
      setError({ message: 'Please enter a batch ID' });
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await aiAPI.getBatchSummary(batchId.trim());
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
    const { batch, lot, vendor, order, fittings, installations, maintenances } = data;

    return (
      <div className="space-y-6">
        {/* Batch Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Batch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="metric-value text-blue-600">{fittings.length}</div>
              <div className="metric-label">Total Items</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-green-600">{installations.length}</div>
              <div className="metric-label">Installations</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-orange-600">{maintenances.length}</div>
              <div className="metric-label">Maintenance Records</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-purple-600">
                {batch.is_qr_printed ? '✓' : '✗'}
              </div>
              <div className="metric-label">QR Printed</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Batch Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Batch ID:</span> {batch.batch_id}
              </div>
              <div>
                <span className="font-medium">Lot ID:</span> {batch.lot_id}
              </div>
              <div>
                <span className="font-medium">Vendor:</span> {vendor?.vendor_name || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Component:</span> {order?.component_type || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Order Type:</span> {order?.order_type || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Printed At:</span> {
                  batch.printed_at 
                    ? new Date(batch.printed_at).toLocaleString()
                    : 'Not printed'
                }
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

            {aiAnalysis.quality_score && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Quality Score</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        aiAnalysis.quality_score >= 8 ? 'bg-green-500' :
                        aiAnalysis.quality_score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(aiAnalysis.quality_score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium">{aiAnalysis.quality_score}/10</span>
                </div>
              </div>
            )}

            {aiAnalysis.issues && aiAnalysis.issues.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Identified Issues</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {aiAnalysis.issues.map((issue, index) => (
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

        {/* Fittings List */}
        {fittings.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Fittings in Batch</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Fitting ID</th>
                    <th className="text-left py-2">Item Number</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Last Inspection</th>
                  </tr>
                </thead>
                <tbody>
                  {fittings.map((fitting, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-mono text-xs">{fitting.fitting_id}</td>
                      <td className="py-2">{fitting.item_number}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          fitting.status === 'new' 
                            ? 'bg-blue-100 text-blue-800'
                            : fitting.status === 'printed'
                            ? 'bg-green-100 text-green-800'
                            : fitting.status === 'inspected'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fitting.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {fitting.last_inspection 
                          ? new Date(fitting.last_inspection).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Installation Records */}
        {installations.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Installation Records</h3>
            <div className="space-y-3">
              {installations.map((installation, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{installation.fitting_id}</div>
                      <div className="text-sm text-gray-600">
                        Status: {installation.status}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(installation.installed_at).toLocaleString()}
                    </span>
                  </div>
                  {installation.location_lat && installation.location_long && (
                    <div className="text-xs text-gray-500">
                      Location: {installation.location_lat.toFixed(4)}, {installation.location_long.toFixed(4)}
                    </div>
                  )}
                  {installation.notes && (
                    <div className="text-sm text-gray-600 mt-2">
                      Notes: {installation.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Records */}
        {maintenances.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance Records</h3>
            <div className="space-y-3">
              {maintenances.map((maintenance, index) => (
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
                  {maintenance.resolution_notes && (
                    <div className="text-sm text-gray-600 mt-2">
                      Resolution: {maintenance.resolution_notes}
                    </div>
                  )}
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
        <h2 className="text-2xl font-bold text-gray-900">Batch Analysis</h2>
        <p className="text-gray-600">Get AI-powered insights for batch performance</p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Analyze Batch</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Batch ID (e.g., V-001-LOT-1-B1)"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
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

export default BatchAnalysis;
