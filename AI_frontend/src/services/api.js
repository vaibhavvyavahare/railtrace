import axios from 'axios';

const AI_CONNECTOR_BASE_URL = 'http://localhost:5055';
const REPORTS_API_BASE_URL = `${AI_CONNECTOR_BASE_URL}/api/reports`;
const ALERTS_API_BASE_URL = `${AI_CONNECTOR_BASE_URL}/api/alerts`;
const HEALTH_API_BASE_URL = `${AI_CONNECTOR_BASE_URL}/health`;

// Create axios instances
const reportsClient = axios.create({
  baseURL: REPORTS_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const alertsClient = axios.create({
  baseURL: ALERTS_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Health check API
export const healthAPI = {
  getHealth: () => axios.get(`${HEALTH_API_BASE_URL}`),
};

// AI Connector APIs
export const aiAPI = {
  // Summaries
  listSummaries: (params = {}) => reportsClient.get('/', { params }),
  generateVendorSummary: (vendor_id) => reportsClient.post('/generate', { vendor_id }),

  // Alerts
  listAlerts: (params = {}) => alertsClient.get('/', { params }),
  evaluateVendorAlerts: (vendor_id) => alertsClient.post('/evaluate', { vendor_id }),
};

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
};

export const getSeverityColor = (severity) => {
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

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'resolved':
    case 'installed':
      return 'green';
    case 'in_progress':
    case 'pending':
      return 'yellow';
    case 'failed':
    case 'error':
      return 'red';
    default:
      return 'gray';
  }
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      details: error.response.data?.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Unable to connect to AI service. Please check if the service is running.',
      status: 0,
      details: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      details: null,
    };
  }
};

export default aiAPI;
