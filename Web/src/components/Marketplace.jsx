import './Marketplace.css';
import { useState, useEffect } from 'react';
import { fetchProduce, fetchSupplies, createOrder, getAuthToken } from '../api.js';

export function Marketplace({ user, token, onNavigate }) {
  const [produce, setProduce] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('produce');
  const [orderModal, setOrderModal] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState({ loading: false, message: '', error: false });

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

  const handleOrder = async (item, type) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setOrderModal({ item, type });
    setOrderQuantity(1);
    setOrderStatus({ loading: false, message: '', error: false });
  };

  const submitOrder = async () => {
    setOrderStatus({ loading: true, message: '', error: false });
    try {
      const authToken = token || getAuthToken();
      await createOrder({
        item_id: orderModal.item.id,
        item_type: orderModal.type,
        quantity: orderQuantity,
        total_price: orderModal.type === 'produce' 
          ? orderModal.item.price_per_unit * orderQuantity
          : orderModal.item.price * orderQuantity
      }, authToken);
      setOrderStatus({ loading: false, message: 'Order placed successfully!', error: false });
      setTimeout(() => setOrderModal(null), 2000);
    } catch (err) {
      setOrderStatus({ loading: false, message: err.message || 'Failed to place order', error: true });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(price);
  };

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
                      onClick={() => handleOrder(item, 'produce')}
                    >
                      {user ? '🛒 Order Now' : '🛒 Login to Order'}
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
                      onClick={() => handleOrder(item, 'supply')}
                    >
                      {user ? '🛒 Buy Now' : '🛒 Login to Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Modal */}
      {orderModal && (
        <div className="modal-overlay" onClick={() => setOrderModal(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOrderModal(null)}>×</button>
            <h2>Place Order</h2>
            <div className="order-item-preview">
              <img src={orderModal.item.image} alt={orderModal.item.name} />
              <div>
                <h3>{orderModal.item.name}</h3>
                <p className="order-price">
                  {orderModal.type === 'produce' 
                    ? `${formatPrice(orderModal.item.price_per_unit)} / ${orderModal.item.unit}`
                    : formatPrice(orderModal.item.price)
                  }
                </p>
              </div>
            </div>
            
            <div className="order-quantity">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}>-</button>
                <input 
                  type="number" 
                  value={orderQuantity} 
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setOrderQuantity(orderQuantity + 1)}>+</button>
              </div>
            </div>
            
            <div className="order-total">
              <span>Total:</span>
              <strong>
                {formatPrice(
                  orderModal.type === 'produce'
                    ? orderModal.item.price_per_unit * orderQuantity
                    : orderModal.item.price * orderQuantity
                )}
              </strong>
            </div>
            
            {orderStatus.message && (
              <div className={`order-status ${orderStatus.error ? 'error' : 'success'}`}>
                {orderStatus.message}
              </div>
            )}
            
            <button 
              className="submit-order-btn"
              onClick={submitOrder}
              disabled={orderStatus.loading || orderStatus.message.includes('success')}
            >
              {orderStatus.loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
