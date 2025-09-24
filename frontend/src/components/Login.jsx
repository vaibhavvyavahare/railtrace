import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

const LoginComponent = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { user_id: userId, password });
      const { user_type } = response.data;
      if (user_type === 'vendor') {
        navigate('/vendor');
      } else if (user_type === 'officer') {
        navigate('/office');
      } else {
        setError('Unknown user type');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check server connection.';
      setError(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="login-container card p-4 mx-auto mt-5" style={{ maxWidth: '400px' }}>
      <div className="card-body">
        <h2 className="card-title text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label htmlFor="userId" className="form-label">User ID</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="form-control" id="userId" placeholder="Enter your ID" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" id="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;