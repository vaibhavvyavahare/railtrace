import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { aiAPI, handleAPIError } from '../services/api';

const MaintenanceAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    loadMaintenanceAlerts();
  }, []);

  const loadMaintenanceAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.getMaintenanceAlerts();
      setAlerts(response.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <XCircle className="text-red-500" size={20} />;
      case 'medium':
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'low':
      case 'info':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'red';
      case 'medium':
      case 'warning':
        return 'yellow';
      case 'low':
      case 'info':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading maintenance alerts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h3>Error Loading Alerts</h3>
        <p>{error.message}</p>
        <button className="btn btn-primary mt-4" onClick={loadMaintenanceAlerts}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!alerts) {
    return (
      <div className="alert alert-warning">
        <h3>No Alerts Available</h3>
        <p>Unable to load maintenance alerts data.</p>
      </div>
    );
  }

  const { critical_alerts = [], predictive_alerts = [], vendor_issues = [], recommendations = [] } = alerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Alerts</h2>
          <p className="text-gray-600">AI-powered maintenance predictions and alerts</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={loadMaintenanceAlerts}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-red-600">{critical_alerts.length}</div>
              <div className="metric-label">Critical Alerts</div>
            </div>
            <XCircle className="text-red-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-yellow-600">{predictive_alerts.length}</div>
              <div className="metric-label">Predictive Alerts</div>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="metric-card border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="metric-value text-blue-600">{vendor_issues.length}</div>
              <div className="metric-label">Vendor Issues</div>
            </div>
            <Clock className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {critical_alerts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle className="text-red-500" size={20} />
            Critical Alerts
          </h3>
          <div className="space-y-4">
            {critical_alerts.map((alert, index) => (
              <div key={index} className="alert-item high">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {alert.message || 'Critical Alert'}
                    </div>
                    {alert.description && (
                      <div className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </div>
                    )}
                    {alert.component_id && (
                      <div className="text-xs text-gray-500 mb-2">
                        Component: {alert.component_id}
                      </div>
                    )}
                    {alert.estimated_impact && (
                      <div className="text-sm text-gray-700">
                        <strong>Impact:</strong> {alert.estimated_impact}
                      </div>
                    )}
                    {alert.recommended_action && (
                      <div className="text-sm text-gray-700 mt-2">
                        <strong>Recommended Action:</strong> {alert.recommended_action}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800`}>
                    {alert.severity || 'High'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictive Alerts */}
      {predictive_alerts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            Predictive Alerts
          </h3>
          <div className="space-y-4">
            {predictive_alerts.map((alert, index) => (
              <div key={index} className="alert-item medium">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {alert.message || 'Predictive Alert'}
                    </div>
                    {alert.description && (
                      <div className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </div>
                    )}
                    {alert.component_id && (
                      <div className="text-xs text-gray-500 mb-2">
                        Component: {alert.component_id}
                      </div>
                    )}
                    {alert.predicted_failure_date && (
                      <div className="text-sm text-gray-700">
                        <strong>Predicted Failure:</strong> {new Date(alert.predicted_failure_date).toLocaleDateString()}
                      </div>
                    )}
                    {alert.confidence_score && (
                      <div className="text-sm text-gray-700">
                        <strong>Confidence:</strong> {alert.confidence_score}%
                      </div>
                    )}
                    {alert.recommended_action && (
                      <div className="text-sm text-gray-700 mt-2">
                        <strong>Recommended Action:</strong> {alert.recommended_action}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800`}>
                    {alert.severity || 'Medium'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor Issues */}
      {vendor_issues.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Vendor Issues
          </h3>
          <div className="space-y-4">
            {vendor_issues.map((issue, index) => (
              <div key={index} className="alert-item low">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {issue.message || 'Vendor Issue'}
                    </div>
                    {issue.description && (
                      <div className="text-sm text-gray-600 mb-2">
                        {issue.description}
                      </div>
                    )}
                    {issue.vendor_id && (
                      <div className="text-xs text-gray-500 mb-2">
                        Vendor: {issue.vendor_id}
                      </div>
                    )}
                    {issue.affected_components && (
                      <div className="text-sm text-gray-700">
                        <strong>Affected Components:</strong> {issue.affected_components}
                      </div>
                    )}
                    {issue.recommended_action && (
                      <div className="text-sm text-gray-700 mt-2">
                        <strong>Recommended Action:</strong> {issue.recommended_action}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800`}>
                    {issue.severity || 'Low'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-500 mt-1" size={16} />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      {recommendation.title || `Recommendation ${index + 1}`}
                    </div>
                    <div className="text-sm text-gray-700">
                      {recommendation.description || recommendation}
                    </div>
                    {recommendation.priority && (
                      <div className="text-xs text-gray-500 mt-2">
                        Priority: {recommendation.priority}
                      </div>
                    )}
                    {recommendation.estimated_impact && (
                      <div className="text-xs text-gray-500">
                        Impact: {recommendation.estimated_impact}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts Message */}
      {critical_alerts.length === 0 && predictive_alerts.length === 0 && vendor_issues.length === 0 && (
        <div className="card p-6 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Systems Normal</h3>
          <p className="text-gray-600">
            No critical maintenance alerts detected. The system is operating within normal parameters.
          </p>
        </div>
      )}

      {/* Raw Data */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Raw Alerts Data</h3>
        <div className="json-viewer">
          {JSON.stringify(alerts, null, 2)}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceAlerts;
