import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Database, Activity, Clock } from 'lucide-react';
import { healthAPI, handleAPIError } from '../services/api';

const SystemHealth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadHealthData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await healthAPI.getDetailedHealth();
      setHealth(response.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'healthy':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'disconnected':
      case 'not_configured':
      case 'unhealthy':
        return <XCircle className="text-red-500" size={20} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'healthy':
        return 'green';
      case 'disconnected':
      case 'not_configured':
      case 'unhealthy':
        return 'red';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getOverallStatus = () => {
    if (!health) return { status: 'Unknown', color: 'gray' };
    
    const { status, dependencies } = health;
    
    if (status === 'healthy' && 
        dependencies?.database === 'connected' && 
        dependencies?.sarvam_ai === 'configured') {
      return { status: 'All Systems Operational', color: 'green' };
    } else if (status === 'healthy') {
      return { status: 'Partially Operational', color: 'yellow' };
    } else {
      return { status: 'System Issues Detected', color: 'red' };
    }
  };

  if (loading && !health) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading system health...
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="alert alert-danger">
        <h3>Error Loading Health Data</h3>
        <p>{error.message}</p>
        <button className="btn btn-primary mt-4" onClick={loadHealthData}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600">Monitor service status and dependencies</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-refresh (30s)</span>
          </label>
          <button 
            className="btn btn-primary"
            onClick={loadHealthData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall System Status</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-medium bg-${overallStatus.color}-100 text-${overallStatus.color}-800`}>
            {overallStatus.status}
          </span>
        </div>
        
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {health.version || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Service Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {health.status === 'healthy' ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Service Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {new Date(health.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">Last Checked</div>
            </div>
          </div>
        )}
      </div>

      {/* Dependencies Status */}
      {health && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Dependencies</h3>
          <div className="space-y-4">
            {/* Database Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="text-blue-500" size={24} />
                <div>
                  <div className="font-medium text-gray-900">PostgreSQL Database</div>
                  <div className="text-sm text-gray-600">Primary data storage</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.dependencies?.database)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(health.dependencies?.database)}-100 text-${getStatusColor(health.dependencies?.database)}-800`}>
                  {health.dependencies?.database || 'unknown'}
                </span>
              </div>
            </div>

            {/* Sarvam AI Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="text-purple-500" size={24} />
                <div>
                  <div className="font-medium text-gray-900">Sarvam AI Service</div>
                  <div className="text-sm text-gray-600">AI analysis and predictions</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.dependencies?.sarvam_ai)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(health.dependencies?.sarvam_ai)}-100 text-${getStatusColor(health.dependencies?.sarvam_ai)}-800`}>
                  {health.dependencies?.sarvam_ai || 'unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Information */}
      {health && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Basic Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Name:</span>
                  <span className="font-medium">{health.service || 'AI Integration Service'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{health.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium text-${getStatusColor(health.status)}-600`}>
                    {health.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Check:</span>
                  <span className="font-medium">
                    {new Date(health.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">
                    {health.uptime || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Checks */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Health Check Endpoints</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Basic Health Check</div>
              <div className="text-sm text-gray-600">GET /health</div>
            </div>
            <a 
              href="http://localhost:3100/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm btn-secondary"
            >
              Test
            </a>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Detailed Health Check</div>
              <div className="text-sm text-gray-600">GET /health/detailed</div>
            </div>
            <a 
              href="http://localhost:3100/health/detailed" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm btn-secondary"
            >
              Test
            </a>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Troubleshooting</h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Database Connection Issues</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check if PostgreSQL is running on localhost:5432</li>
              <li>• Verify database credentials in .env file</li>
              <li>• Ensure database 'railtrace_db' exists</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">AI Service Issues</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verify SARVAM_API_KEY is set in .env file</li>
              <li>• Check if Sarvam AI service is accessible</li>
              <li>• Review API rate limits and quotas</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Service Restart</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Stop the service: Ctrl+C</li>
              <li>• Restart: npm start or node server.js</li>
              <li>• Check logs for error messages</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Raw Health Data */}
      {health && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Raw Health Data</h3>
          <div className="json-viewer">
            {JSON.stringify(health, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
