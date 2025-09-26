import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Frontend Test Page</h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, the React app is working correctly.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>React Version:</span>
            <span className="font-mono">{React.version}</span>
          </div>
          <div className="flex justify-between">
            <span>Environment:</span>
            <span className="font-mono">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex justify-between">
            <span>Timestamp:</span>
            <span className="font-mono">{new Date().toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm">
            ✅ React app is running successfully!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
