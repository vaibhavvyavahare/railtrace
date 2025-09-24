import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const DashboardOverview = () => {
  const [summary, setSummary] = useState({ vendors: 0, orders: 0, items: 0, completed: 0, inProgress: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/officer/dashboard-summary`);
        setSummary(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard summary. Please ensure the backend is running.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchSummary();
  }, []);

  if (loading) return <div>Loading Overview...</div>;

  return (
    <div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
                <div className="card text-white bg-primary h-100">
                    <div className="card-header">Total Vendors</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{summary.vendors}</h5>
                    </div>
                </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
                <div className="card text-white bg-secondary h-100">
                    <div className="card-header">Total Orders</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{summary.orders}</h5>
                    </div>
                </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
                <div className="card text-white bg-info h-100">
                    <div className="card-header">Total Installed Items</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{summary.items}</h5>
                    </div>
                </div>
            </div>
        </div>
        <hr />
        <h4>Order Quick Stats</h4>
        <div className="row">
            <div className="col-lg-4 col-md-6 mb-3">
                <div className="card text-white bg-success h-100">
                    <div className="card-header">Completed Orders</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{summary.completed}</h5>
                    </div>
                </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
                <div className="card text-white bg-warning h-100">
                    <div className="card-header">In-Progress Orders</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{summary.inProgress}</h5>
                    </div>
                </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-3">
                <div className="card text-white bg-danger h-100">
                    <div className="card-header">Pending Orders</div>
                    <div className="card-body">
                        <h5 className="card-title display-4">{summary.pending}</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardOverview;