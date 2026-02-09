import { useState } from 'react';
import { register, saveAuthToken, saveUser } from '../api.js';
import './AuthPages.css';

export function RegisterPage({ onRegister, onNavigate }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await register(registrationData);
      
      // Save auth data
      if (response.token) {
        saveAuthToken(response.token);
        saveUser(response.user);
        onRegister(response.user, response.token);
      } else {
        // If no token returned, redirect to login
        onNavigate('login');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-header">
          <span className="auth-icon">🌾</span>
          <h1>Join FarmUp</h1>
          <p>Create your account and start your farming journey</p>
        </div>
        
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Account</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Profile</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <button type="submit" className="auth-submit-btn">
                Continue
              </button>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+256 7XX XXX XXX"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">I want to join as *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">Buyer / Customer</option>
                  <option value="farmer">Farmer</option>
                  <option value="seller">Vendor / Seller</option>
                </select>
              </div>
              
              <div className="role-description">
                {formData.role === 'user' && (
                  <p>🛒 As a <strong>Buyer</strong>, you can browse and purchase produce from farmers and supplies from vendors.</p>
                )}
                {formData.role === 'farmer' && (
                  <p>🌱 As a <strong>Farmer</strong>, you can list your produce, manage your lands, and track farm activities.</p>
                )}
                {formData.role === 'seller' && (
                  <p>🔧 As a <strong>Vendor</strong>, you can sell farm supplies and equipment to farmers.</p>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="auth-back-btn"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner">
                      <span className="spinner"></span>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>Already have an account?</p>
          <button 
            type="button" 
            className="auth-link-btn"
            onClick={() => onNavigate('login')}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
