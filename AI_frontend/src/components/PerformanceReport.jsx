import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { aiAPI, handleAPIError } from '../services/api';

const PerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadPerformanceReport();
  }, []);

  const loadPerformanceReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const [sumRes, alertRes] = await Promise.all([
        aiAPI.listSummaries({ limit: 200 }),
        aiAPI.listAlerts({ limit: 200 })
      ]);
      setSummaries(sumRes.data || []);
      setAlerts(alertRes.data || []);
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

  const vendorIds = Array.from(new Set(summaries.map(s => s.vendor_id).filter(Boolean)));
  const vendorSummaryCounts = vendorIds.map(vId => ({
    name: vId,
    vendor: vId,
    vendorSummaries: summaries.filter(s => s.vendor_id === vId && s.scope === 'vendor').length,
    lotSummaries: summaries.filter(s => s.vendor_id === vId && s.scope === 'lot').length,
    batchSummaries: summaries.filter(s => s.vendor_id === vId && s.scope === 'batch').length,
  }));

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

  if (!summaries && !alerts) {
    return (
      <div className="alert alert-warning">
        <h3>No Data Available</h3>
        <p>Unable to load performance report data.</p>
      </div>
    );
  }

  const severityData = getStatusData(alerts, 'severity');
  const scopeData = getStatusData(summaries, 'scope');
  const vendorScopeSummaries = summaries.filter(s => (s.scope || '').toLowerCase() === 'vendor');
  const batchScopeSummaries = summaries.filter(s => (s.scope || '').toLowerCase() === 'batch');

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

      {/* Key Metrics */
      }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-blue-600">{vendorIds.length}</div>
              <div className="metric-label">Vendors Covered</div>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-green-600">{summaries.length}</div>
              <div className="metric-label">Total Summaries</div>
            </div>
            <Activity className="text-green-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-purple-600">{alerts.length}</div>
              <div className="metric-label">Total Alerts</div>
            </div>
            <Activity className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-orange-600">{alerts.filter(a => (a.status || '').toLowerCase() !== 'resolved').length}</div>
              <div className="metric-label">Open Alerts</div>
            </div>
            <TrendingUp className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Severity Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Alerts Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Scope Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold mb-4">Summary Scope Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scopeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {scopeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Summary Coverage */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold mb-4">Vendor Summary Coverage</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={vendorSummaryCounts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="vendorSummaries" fill="#3b82f6" name="Vendor" />
            <Bar dataKey="lotSummaries" fill="#10b981" name="Lot" />
            <Bar dataKey="batchSummaries" fill="#f59e0b" name="Batch" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Latest Summaries */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Latest Summaries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Vendor</th>
                <th className="text-left py-2">Scope</th>
                <th className="text-left py-2">Lot</th>
                <th className="text-left py-2">Batch</th>
                <th className="text-left py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {summaries.slice(0, 10).map((s, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    <div>
                      <div className="font-medium">{s.vendor_id}</div>
                    </div>
                  </td>
                  <td className="py-2">{s.scope}</td>
                  <td className="py-2">{s.lot_id || '—'}</td>
                  <td className="py-2">{s.batch_id || '—'}</td>
                  <td className="py-2">{s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Vendors Reports */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">All Vendors Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Vendor</th>
                <th className="text-left py-2">Summary Preview</th>
                <th className="text-left py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {vendorScopeSummaries.map((s, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{s.vendor_id}</td>
                  <td className="py-2 max-w-xl truncate" title={s.summary_text}>{s.summary_text}</td>
                  <td className="py-2">{s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch-wise Fitting Reports & Summaries */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Batch-wise Fitting Reports & Summaries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Vendor</th>
                <th className="text-left py-2">Lot</th>
                <th className="text-left py-2">Batch</th>
                <th className="text-left py-2">Summary Preview</th>
                <th className="text-left py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {batchScopeSummaries.map((s, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{s.vendor_id}</td>
                  <td className="py-2">{s.lot_id || '—'}</td>
                  <td className="py-2">{s.batch_id || '—'}</td>
                  <td className="py-2 max-w-xl truncate" title={s.summary_text}>{s.summary_text}</td>
                  <td className="py-2">{s.created_at ? new Date(s.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Raw Report Data</h3>
        <div className="json-viewer">
          {JSON.stringify({ summaries, alerts }, null, 2)}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
