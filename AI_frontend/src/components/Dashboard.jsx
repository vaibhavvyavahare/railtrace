import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Package, 
  Activity,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { aiAPI, healthAPI, handleAPIError } from '../services/api';
import ServiceUnavailable from './ServiceUnavailable';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [healthRes, performanceRes, alertsRes] = await Promise.allSettled([
        healthAPI.getDetailedHealth(),
        aiAPI.getPerformanceReport(),
        aiAPI.getMaintenanceAlerts()
      ]);

      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value.data);
      } else {
        console.warn('Health check failed:', healthRes.reason);
        setSystemHealth({ status: 'unhealthy', dependencies: { database: 'unknown', sarvam_ai: 'unknown' } });
      }

      if (performanceRes.status === 'fulfilled') {
        setPerformanceData(performanceRes.value.data);
      } else {
        console.warn('Performance report failed:', performanceRes.reason);
        setPerformanceData({ vendors: [], orders: [], lots: [], batches: [], fittings: [], installations: [], maintenances: [] });
      }

      if (alertsRes.status === 'fulfilled') {
        setAlerts(alertsRes.value.data.alerts || []);
      } else {
        console.warn('Alerts failed:', alertsRes.reason);
        setAlerts([]);
      }

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (!systemHealth) return { status: 'unknown', color: 'gray' };
    
    if (systemHealth.status === 'healthy') {
      return { status: 'Healthy', color: 'green' };
    } else {
      return { status: 'Issues Detected', color: 'red' };
    }
  };

  const getCriticalAlerts = () => {
    return alerts.filter(alert => 
      alert.severity?.toLowerCase() === 'high' || 
      alert.severity?.toLowerCase() === 'critical'
    ).length;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading dashboard...
      </div>
    );
  }

  // Check if AI service is completely unavailable
  if (error && error.status === 0) {
    return <ServiceUnavailable onRetry={loadDashboardData} />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h3>Error Loading Dashboard</h3>
        <p>{error.message}</p>
        <button className="btn btn-primary mt-4" onClick={loadDashboardData}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const healthStatus = getHealthStatus();
  const criticalAlerts = getCriticalAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Real-time insights and system status</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={loadDashboardData}
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
              <div className="metric-value text-blue-600">
                {systemHealth?.dependencies?.database === 'connected' ? '✓' : '✗'}
              </div>
              <div className="metric-label">Database Status</div>
            </div>
            <Database className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-green-600">
                {systemHealth?.dependencies?.sarvam_ai === 'configured' ? '✓' : '✗'}
              </div>
              <div className="metric-label">AI Service</div>
            </div>
            <Activity className="text-green-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-yellow-600">
                {criticalAlerts}
              </div>
              <div className="metric-label">Critical Alerts</div>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-purple-600">
                {performanceData?.data?.vendors?.length || 0}
              </div>
              <div className="metric-label">Active Vendors</div>
            </div>
            <Users className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* System Health Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${healthStatus.color}-100 text-${healthStatus.color}-800`}>
            {healthStatus.status}
          </span>
        </div>
        
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Dependencies</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    systemHealth.dependencies?.database === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.dependencies?.database || 'unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI Service</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    systemHealth.dependencies?.sarvam_ai === 'configured' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {systemHealth.dependencies?.sarvam_ai || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Service Info</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Version: {systemHealth.version}</div>
                <div>Last Updated: {new Date(systemHealth.timestamp).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <a href="/alerts" className="btn btn-sm btn-secondary">
              <ExternalLink size={14} />
              View All
            </a>
          </div>
          
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div 
                key={index}
                className={`alert-item ${alert.severity?.toLowerCase() || 'low'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {alert.message || 'Alert'}
                    </div>
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

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/vendor" className="btn btn-primary">
            <Users size={16} />
            Analyze Vendors
          </a>
          <a href="/batch" className="btn btn-secondary">
            <Package size={16} />
            Check Batches
          </a>
          <a href="/performance" className="btn btn-success">
            <TrendingUp size={16} />
            View Reports
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
