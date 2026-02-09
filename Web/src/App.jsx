import { useState, useEffect } from 'react';
import './App.css';
import { Navbar } from './components/Navbar.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { Marketplace } from './components/Marketplace.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { FarmerDashboard } from './admin/FarmerDashboard.jsx';
import { CustomerDashboard } from './admin/CustomerDashboard.jsx';
import { VendorDashboard } from './admin/VendorDashboard.jsx';
import { AdminDashboard } from './admin/AdminDashboard.jsx';
import { getStoredUser, getAuthToken, logout as apiLogout } from './api.js';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getAuthToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
    setActivePage('home');
  };

  const handleNavigate = (page) => {
    // Redirect to login if trying to access dashboard without auth
    if (page === 'dashboard' && !user) {
      setActivePage('login');
      return;
    }
    setActivePage(page);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🌾</span>
          <p style={{ color: '#2e7d32', fontWeight: '600' }}>Loading FarmUp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        activePage={activePage} 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        {activePage === 'home' && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        
        {activePage === 'marketplace' && (
          <Marketplace user={user} token={token} onNavigate={handleNavigate} />
        )}
        
        {activePage === 'login' && !user && (
          <LoginPage 
            onLogin={handleLogin} 
            onNavigate={handleNavigate}
          />
        )}
        
        {activePage === 'register' && !user && (
          <RegisterPage 
            onRegister={handleLogin}
            onNavigate={handleNavigate}
          />
        )}
        
        {activePage === 'dashboard' && user && (
          <DashboardLayout user={user} token={token}>
            {user.role === 'admin' && <AdminDashboard user={user} token={token} />}
            {user.role === 'farmer' && <FarmerDashboard user={user} token={token} />}
            {(user.role === 'customer' || user.role === 'user') && <CustomerDashboard user={user} token={token} />}
            {(user.role === 'vendor' || user.role === 'seller') && <VendorDashboard user={user} token={token} />}
          </DashboardLayout>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

function DashboardLayout({ user, children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} />
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span style={{ fontSize: '1.5rem' }}>🌾</span>
          <span style={{ fontWeight: '600' }}>FarmUp</span>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </div>
        <div className="footer-contact">
          <p>📍 Kampala, Uganda</p>
          <p>📞 +256 700 123 456</p>
          <p>✉️ support@farmup.ug</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 FarmUp. Empowering Farmers Across Uganda.</p>
      </div>
    </footer>
  );
}

export default App;
