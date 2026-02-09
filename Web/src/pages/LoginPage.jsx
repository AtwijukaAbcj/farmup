import { useState } from 'react';
import { login, saveAuthToken, saveUser } from '../api.js';
import './AuthPages.css';

export function LoginPage({ onLogin, onNavigate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await login(username, password);
      
      // Save auth data
      saveAuthToken(response.token);
      saveUser(response.user);
      
      // Notify parent
      onLogin(response.user, response.token);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">🌾</span>
          <h1>Welcome Back</h1>
          <p>Sign in to access your FarmUp account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button 
            type="button" 
            className="auth-link-btn"
            onClick={() => onNavigate('register')}
          >
            Create Account
          </button>
        </div>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <button 
          type="button" 
          className="auth-guest-btn"
          onClick={() => onNavigate('marketplace')}
        >
          Browse Marketplace as Guest
        </button>
      </div>
      
      <div className="auth-features">
        <h2>Why FarmUp?</h2>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">🌱</span>
            <div>
              <h3>For Farmers</h3>
              <p>List your produce, manage lands, and track farm activities</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛒</span>
            <div>
              <h3>For Buyers</h3>
              <p>Buy fresh produce directly from local farmers</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔧</span>
            <div>
              <h3>For Vendors</h3>
              <p>Sell farm supplies and equipment to farmers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
