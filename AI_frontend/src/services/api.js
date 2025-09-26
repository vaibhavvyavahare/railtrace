import axios from 'axios';

const AI_API_BASE_URL = 'http://localhost:3100/api/ai';
const HEALTH_API_BASE_URL = 'http://localhost:3100/health';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check API
export const healthAPI = {
  getHealth: () => axios.get(`${HEALTH_API_BASE_URL}`),
  getDetailedHealth: () => axios.get(`${HEALTH_API_BASE_URL}/detailed`),
};

// AI Analysis APIs
export const aiAPI = {
  // Vendor Analysis
  getVendorSummary: (vendorId) => 
    apiClient.get(`/vendor/${vendorId}/summary`),
  
  // Batch Analysis
  getBatchSummary: (batchId) => 
    apiClient.get(`/batch/${batchId}/summary`),
  
  // Lot Analysis
  getLotSummary: (lotId) => 
    apiClient.get(`/lot/${lotId}/summary`),
  
  // Performance Reports
  getPerformanceReport: () => 
    apiClient.get('/performance/report'),
  
  // Maintenance Alerts
  getMaintenanceAlerts: () => 
    apiClient.get('/alerts/maintenance'),
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

export default apiClient;
