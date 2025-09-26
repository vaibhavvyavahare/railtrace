import React, { useState } from 'react';
import { Search, RefreshCw, Package, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { aiAPI, handleAPIError } from '../services/api';

const BatchAnalysis = () => {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const handleAnalyze = async () => {
    if (!batchId.trim()) {
      setError({ message: 'Please enter a batch ID' });
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const [sumRes, alertRes] = await Promise.all([
        aiAPI.listSummaries({ batch_id: batchId.trim(), limit: 10 }),
        aiAPI.listAlerts({ batch_id: batchId.trim(), limit: 50 })
      ]);
      setSummaries(sumRes.data || []);
      setAlerts(alertRes.data || []);
      setAnalysis({ batch_id: batchId.trim() });
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;
    const batchSummaries = summaries;
    const batchAlerts = alerts;
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Batch Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="metric-value text-blue-600">{batchAlerts.length}</div>
              <div className="metric-label">Alerts</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-green-600">{batchSummaries.length}</div>
              <div className="metric-label">Summaries</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Batch Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Batch ID:</span> {analysis.batch_id}
              </div>
            </div>
          </div>
        </div>

        {batchSummaries.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Batch Summaries</h3>
            <div className="space-y-4">
              {batchSummaries.map((s, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">{s.created_at ? new Date(s.created_at).toLocaleString() : ''}</div>
                  <div className="text-gray-800 whitespace-pre-wrap">{s.summary_text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {batchAlerts.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Batch Alerts</h3>
            <div className="space-y-3">
              {batchAlerts.map((alert, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{alert.alert_type}</div>
                      <div className="text-sm text-gray-600">{alert.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      (alert.severity || '').toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                      (alert.severity || '').toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity || 'low'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Fitting: {alert.fitting_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Raw Analysis Data</h3>
          <div className="json-viewer">
            {JSON.stringify({ summaries, alerts }, null, 2)}
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
