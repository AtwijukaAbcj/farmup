import './Marketplace.css';
import { useState, useEffect } from 'react';
import { fetchProduce, fetchSupplies, createCartCheckout, createTrustPaySession, getAuthToken } from '../api.js';

export function Marketplace({ user, token, onNavigate }) {
  const [produce, setProduce] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('produce');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState({ loading: false, message: '', error: false });
  const [createdCheckout, setCreatedCheckout] = useState(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [produceData, suppliesData] = await Promise.all([
        fetchProduce(),
        fetchSupplies()
      ]);
      setProduce(Array.isArray(produceData) ? produceData : []);
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item, type) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (type !== 'produce') return;
    setCart(current => {
      const existing = current.find(cartItem => cartItem.id === item.id);
      if (existing) return current.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const submitCheckout = async () => {
    if (!cart.length) return;
    setOrderStatus({ loading: true, message: '', error: false });
    try {
      const checkout = await createCartCheckout(cart, token || getAuthToken());
      setCreatedCheckout(checkout);
      setOrderStatus({ loading: false, message: 'Checkout created. Continue to secure payment.', error: false });
    } catch (err) {
      setOrderStatus({ loading: false, message: err.message || 'Failed to place order', error: true });
    }
  };

  const payWithTrustPay = async () => {
    setOrderStatus({ loading: true, message: '', error: false });
    try {
      const session = await createTrustPaySession(createdCheckout.id, token || getAuthToken());
      if (!session.checkout_url) throw new Error('TrustPay did not return a checkout URL');
      window.location.assign(session.checkout_url);
    } catch (err) {
      setOrderStatus({ loading: false, message: err.message || 'Unable to start secure payment', error: true });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(price);
  };

  const cartTotal = cart.reduce((total, item) => total + Number(item.price_per_unit) * item.quantity, 0);

  return (
    <div className="marketplace">
      {/* Hero Banner */}
      <div className="market-hero">
        <div className="market-hero-content">
          <h1>🛒 FarmUp Marketplace</h1>
          <p>Fresh produce from local farmers & quality farm supplies</p>
          {!user && (
            <div className="hero-cta">
              <button className="cta-btn primary" onClick={() => onNavigate('register')}>
                Join to Start Buying
              </button>
              <span className="cta-divider">or</span>
              <button className="cta-btn secondary" onClick={() => onNavigate('login')}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="market-tabs">
        <button 
          className={`tab-btn ${activeTab === 'produce' ? 'active' : ''}`}
          onClick={() => setActiveTab('produce')}
        >
          🌾 Fresh Produce ({produce.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'supplies' ? 'active' : ''}`}
          onClick={() => setActiveTab('supplies')}
        >
          🔧 Farm Supplies ({supplies.length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="market-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading marketplace...</p>
        </div>
      )}

      {/* Produce Section */}
      {!loading && activeTab === 'produce' && (
        <div className="market-section">
          <h3>Available Produce</h3>
          {produce.length === 0 ? (
            <div className="empty-state">
              <span>🌱</span>
              <p>No produce available at the moment</p>
            </div>
          ) : (
            <div className="card-list">
              {produce.map(item => (
                <div className="market-card" key={item.id}>
                  <img src={item.image} alt={item.name} className="market-img" />
                  <div className="market-info">
                    <h4>{item.name}</h4>
                    <p className="price">{formatPrice(item.price_per_unit)} / {item.unit}</p>
                    <p><strong>Farmer:</strong> {item.farmer}</p>
                    <p><strong>Location:</strong> {item.location || 'Uganda'}</p>
                    <p className="stock">
                      <span className="stock-badge">{item.quantity_available} {item.unit} available</span>
                    </p>
                    <button 
                      className="market-btn"
                      onClick={() => addToCart(item, 'produce')}
                    >
                      {user ? '🛒 Add to Cart' : '🛒 Login to Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supplies Section */}
      {!loading && activeTab === 'supplies' && (
        <div className="market-section">
          <h3>Farm Supplies & Tools</h3>
          {supplies.length === 0 ? (
            <div className="empty-state">
              <span>🔧</span>
              <p>No supplies available at the moment</p>
            </div>
          ) : (
            <div className="card-list">
              {supplies.map(item => (
                <div className="market-card" key={item.id}>
                  <img src={item.image} alt={item.name} className="market-img" />
                  <div className="market-info">
                    <h4>{item.name}</h4>
                    <p className="price">{formatPrice(item.price)}</p>
                    <p><strong>Vendor:</strong> {item.vendor}</p>
                    {item.description && <p className="description">{item.description}</p>}
                    <p className="stock">
                      <span className="stock-badge">{item.stock} in stock</span>
                    </p>
                    <button 
                      className="market-btn"
                      onClick={() => addToCart(item, 'supply')}
                    >
                      {user ? '🛒 Add to Cart' : '🛒 Login to Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user && (
        <button className="cart-fab" onClick={() => { setCartOpen(true); setCreatedCheckout(null); setOrderStatus({ loading: false, message: '', error: false }); }}>
          🛒 Cart ({cart.reduce((count, item) => count + item.quantity, 0)})
        </button>
      )}

      {/* Cart checkout */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCartOpen(false)}>×</button>
            <h2>Your Cart</h2>
            {cart.map(item => (
              <div className="cart-line" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <strong>{formatPrice(Number(item.price_per_unit) * item.quantity)}</strong>
              </div>
            ))}
            <div className="order-total">
              <span>Total:</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            
            {orderStatus.message && (
              <div className={`order-status ${orderStatus.error ? 'error' : 'success'}`}>
                {orderStatus.message}
              </div>
            )}
            
            <button 
              className="submit-order-btn"
              onClick={submitCheckout}
              disabled={orderStatus.loading || Boolean(createdCheckout) || !cart.length}
            >
              {orderStatus.loading ? 'Processing...' : 'Create Checkout'}
            </button>
            {createdCheckout && (
              <button
                className="trustpay-btn"
                onClick={payWithTrustPay}
                disabled={orderStatus.loading}
              >
                {orderStatus.loading ? 'Connecting to TrustPay...' : 'Pay securely with TrustPay'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
