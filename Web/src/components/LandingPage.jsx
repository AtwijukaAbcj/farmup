import { useState, useEffect } from 'react';
import './LandingPage.css';
import { fetchProduce, fetchSupplies } from '../api.js';

const services = [
  {
    id: 1,
    icon: '👨‍🌾',
    title: 'Farmer Registration',
    description: 'Easy digital registration for farmers with profile management and unique farmer ID generation.',
    features: ['Digital Profile', 'Unique Farmer ID', 'Document Upload', 'Status Tracking']
  },
  {
    id: 2,
    icon: '💰',
    title: 'Loan Services',
    description: 'Access agricultural loans with streamlined application process and transparent tracking.',
    features: ['Quick Application', 'Multiple Loan Types', 'Real-time Status', 'Digital Approval']
  },
  {
    id: 3,
    icon: '🌍',
    title: 'Land Management',
    description: 'Register and manage your farm lands with GPS mapping and detailed record keeping.',
    features: ['GPS Mapping', 'Land Records', 'Crop Tracking', 'Area Calculation']
  },
  {
    id: 4,
    icon: '📋',
    title: 'Activity Tracking',
    description: 'Log and monitor all farming activities from planting to harvest with detailed analytics.',
    features: ['Activity Logging', 'Progress Reports', 'Cost Tracking', 'Yield Analysis']
  },
  {
    id: 5,
    icon: '🐄',
    title: 'Animal Management',
    description: 'Complete livestock management with health records, breeding tracking, and inventory.',
    features: ['Animal Registry', 'Health Records', 'Vaccination Tracking', 'Breeding Logs']
  },
  {
    id: 6,
    icon: '🛒',
    title: 'Marketplace',
    description: 'Buy and sell agricultural produce, supplies, and equipment in our digital marketplace.',
    features: ['Sell Produce', 'Buy Supplies', 'Price Discovery', 'Direct Connect']
  }
];

const stats = [
  { value: '10,000+', label: 'Registered Farmers' },
  { value: '50,000+', label: 'Acres Managed' },
  { value: 'UGX 2B+', label: 'Loans Facilitated' },
  { value: '500+', label: 'Market Listings' }
];

export function LandingPage({ onNavigate }) {
  const [hoveredService, setHoveredService] = useState(null);
  const [featuredProduce, setFeaturedProduce] = useState([]);
  const [featuredSupplies, setFeaturedSupplies] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const [produceData, suppliesData] = await Promise.all([
        fetchProduce(),
        fetchSupplies()
      ]);
      // Get first 4 items of each
      setFeaturedProduce(Array.isArray(produceData) ? produceData.slice(0, 4) : []);
      setFeaturedSupplies(Array.isArray(suppliesData) ? suppliesData.slice(0, 4) : []);
    } catch (err) {
      console.error('Failed to load featured products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Empowering <span className="highlight">Farmers</span> with Digital Tools
          </h1>
          <p className="hero-subtitle">
            FarmUp provides comprehensive digital solutions for modern agricultural management - 
            from farmer registration to loan access, land management, and marketplace connectivity.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => onNavigate && onNavigate('register')}>Get Started</button>
            <button className="btn-secondary" onClick={() => onNavigate && onNavigate('marketplace')}>Browse Marketplace</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" 
              alt="Farmer in field"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section - Right after banner */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">🛒 Fresh From The Farm</h2>
          <p className="section-subtitle">Browse our marketplace for fresh produce and quality farm supplies</p>
        </div>

        {loadingProducts ? (
          <div className="featured-loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            {/* Fresh Produce */}
            {featuredProduce.length > 0 && (
              <div className="featured-category">
                <h3 className="category-title">🌾 Fresh Produce</h3>
                <div className="featured-grid">
                  {featuredProduce.map(item => (
                    <div key={item.id} className="featured-card">
                      <img src={item.image} alt={item.name} className="featured-img" />
                      <div className="featured-info">
                        <h4>{item.name}</h4>
                        <p className="featured-price">{formatPrice(item.price_per_unit)} / {item.unit}</p>
                        <p className="featured-seller">By {item.farmer}</p>
                        <span className="featured-location">📍 {item.location || 'Uganda'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farm Supplies */}
            {featuredSupplies.length > 0 && (
              <div className="featured-category">
                <h3 className="category-title">🔧 Farm Supplies</h3>
                <div className="featured-grid">
                  {featuredSupplies.map(item => (
                    <div key={item.id} className="featured-card">
                      <img src={item.image} alt={item.name} className="featured-img" />
                      <div className="featured-info">
                        <h4>{item.name}</h4>
                        <p className="featured-price">{formatPrice(item.price)}</p>
                        <p className="featured-seller">By {item.vendor}</p>
                        {item.description && <p className="featured-desc">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="featured-cta">
              <button className="btn-primary" onClick={() => onNavigate && onNavigate('marketplace')}>
                View All Products →
              </button>
            </div>
          </>
        )}
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive digital tools designed specifically for agricultural success
          </p>
        </div>
        
        <div className="services-grid">
          {services.map(service => (
            <div 
              key={service.id}
              className={`service-card ${hoveredService === service.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started with FarmUp in 4 simple steps</p>
        </div>
        
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Register</h4>
              <p>Create your account and complete your farmer profile</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Add Your Farm</h4>
              <p>Register your land with GPS mapping and details</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Manage & Track</h4>
              <p>Log activities, manage livestock, apply for loans</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Grow & Sell</h4>
              <p>Access marketplace to sell produce and buy supplies</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Farming?</h2>
          <p>Join thousands of farmers already using FarmUp to manage their agricultural activities efficiently.</p>
          <button className="btn-primary btn-large" onClick={() => onNavigate && onNavigate('register')}>Start Free Today</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🌾 FarmUp</span>
            <p>Empowering farmers with digital tools for a sustainable future.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Services</h4>
              <a href="#">Farmer Registration</a>
              <a href="#">Loan Services</a>
              <a href="#">Land Management</a>
              <a href="#">Marketplace</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">FAQs</a>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 FarmUp Uganda. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
