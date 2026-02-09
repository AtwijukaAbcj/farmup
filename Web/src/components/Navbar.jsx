// FarmUp Modern Navigation Bar
import { useState } from 'react';
import './Navbar.css';

export function Navbar({ user, activePage, onNavigate, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand" onClick={() => onNavigate('home')}>
          <span className="brand-icon">🌾</span>
          <span className="brand-text">FarmUp</span>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        {/* Navigation Links */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <NavLink 
              active={activePage === 'home'} 
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              icon="🏠"
            >
              Home
            </NavLink>
            <NavLink 
              active={activePage === 'marketplace'} 
              onClick={() => { onNavigate('marketplace'); setMobileMenuOpen(false); }}
              icon="🛒"
            >
              Marketplace
            </NavLink>
            
            {user && (
              <NavLink 
                active={activePage === 'dashboard'} 
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                icon="📊"
              >
                Dashboard
              </NavLink>
            )}
          </div>
          
          <div className="navbar-actions">
            {user ? (
              <div className="user-section">
                <div className="user-avatar">
                  {user.role === 'farmer' && '👨‍🌾'}
                  {user.role === 'vendor' && '🏪'}
                  {(user.role === 'customer' || user.role === 'user') && '👤'}
                  {user.role === 'admin' && '👑'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.username}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button className="logout-btn" onClick={onLogout}>
                  <span className="logout-icon">⬅</span>
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="btn-login"
                  onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                >
                  Login
                </button>
                <button 
                  className="btn-register"
                  onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ children, active, onClick, icon }) {
  return (
    <button className={`nav-link ${active ? 'active' : ''}`} onClick={onClick}>
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-text">{children}</span>
    </button>
  );
}
