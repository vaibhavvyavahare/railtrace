import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

const ServiceUnavailable = ({ onRetry, serviceName = "AI Integration Service" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Service Unavailable</h3>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          The {serviceName} is not running or not accessible. Please ensure the service is started.
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <div className="text-sm text-yellow-800">
            <strong>To start the AI Integration service:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Open terminal in AI_Integration folder</li>
              <li>Run: <code className="bg-yellow-100 px-1 rounded">npm start</code></li>
              <li>Ensure it's running on port 3100</li>
            </ol>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
          <a
            href="http://localhost:3100/health"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Check Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnavailable;
