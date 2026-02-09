// Central API utility for FarmUp backend calls
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const AUTH_URL = `${API_BASE}/auth`;
const MARKETPLACE_URL = `${API_BASE}/marketplace`;

// ============ AUTH API ============

export async function login(username, password) {
  const res = await fetch(`${AUTH_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Login failed');
  return data;
}

export async function register(userData) {
  const res = await fetch(`${AUTH_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Registration failed');
  return data;
}

export async function getUserProfile(token) {
  const res = await fetch(`${AUTH_URL}/profile/`, {
    headers: { Authorization: `Token ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get profile');
  return data;
}

export async function updateUserProfile(token, profileData) {
  const res = await fetch(`${AUTH_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

// ============ MARKETPLACE API - PUBLIC ============

export async function fetchProduce() {
  try {
    const res = await fetch(`${MARKETPLACE_URL}/produce/`);
    if (!res.ok) {
      console.warn('Produce API not available, using demo data');
      return getDemoProduce();
    }
    const data = await res.json();
    // Handle paginated response (DRF returns {count, results, next, previous})
    const items = data.results || data;
    // If API returns empty array, use demo data
    if (!Array.isArray(items) || items.length === 0) {
      return getDemoProduce();
    }
    return items;
  } catch (err) {
    console.warn('Failed to fetch produce:', err);
    return getDemoProduce();
  }
}

export async function fetchSupplies() {
  try {
    const res = await fetch(`${MARKETPLACE_URL}/supplies/`);
    if (!res.ok) {
      console.warn('Supplies API not available, using demo data');
      return getDemoSupplies();
    }
    const data = await res.json();
    // Handle paginated response (DRF returns {count, results, next, previous})
    const items = data.results || data;
    // If API returns empty array, use demo data
    if (!Array.isArray(items) || items.length === 0) {
      return getDemoSupplies();
    }
    return items;
  } catch (err) {
    console.warn('Failed to fetch supplies:', err);
    return getDemoSupplies();
  }
}

// ============ MARKETPLACE API - AUTHENTICATED ============

export async function postProduce(data, token) {
  const res = await fetch(`${MARKETPLACE_URL}/produce/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to post produce');
  return result;
}

export async function postSupply(data, token) {
  const res = await fetch(`${MARKETPLACE_URL}/supplies/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to post supply');
  return result;
}

export async function createOrder(orderData, token) {
  const res = await fetch(`${MARKETPLACE_URL}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(orderData)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to create order');
  return result;
}

export async function fetchOrders(token) {
  const res = await fetch(`${MARKETPLACE_URL}/orders/`, {
    headers: { Authorization: `Token ${token}` }
  });
  if (!res.ok) return [];
  return res.json();
}

// ============ LOCAL STORAGE HELPERS ============

export function saveAuthToken(token) {
  localStorage.setItem('farmup_token', token);
}

export function getAuthToken() {
  return localStorage.getItem('farmup_token');
}

export function removeAuthToken() {
  localStorage.removeItem('farmup_token');
}

export function saveUser(user) {
  localStorage.setItem('farmup_user', JSON.stringify(user));
}

export function getStoredUser() {
  const user = localStorage.getItem('farmup_user');
  return user ? JSON.parse(user) : null;
}

export function removeUser() {
  localStorage.removeItem('farmup_user');
}

export function logout() {
  removeAuthToken();
  removeUser();
}

// ============ DEMO DATA FALLBACK ============

function getDemoProduce() {
  return [
    { id: 1, name: 'Fresh Tomatoes', price_per_unit: 3500, unit: 'kg', farmer: 'John Mukasa', quantity_available: 100, image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', location: 'Luwero' },
    { id: 2, name: 'Yellow Maize', price_per_unit: 2000, unit: 'kg', farmer: 'Mary Nakato', quantity_available: 200, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', location: 'Masaka' },
    { id: 3, name: 'Fresh Beans', price_per_unit: 4000, unit: 'kg', farmer: 'Peter Ssemwanga', quantity_available: 150, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80', location: 'Jinja' },
    { id: 4, name: 'Matoke (Bananas)', price_per_unit: 8000, unit: 'bunch', farmer: 'Grace Nansubuga', quantity_available: 50, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80', location: 'Mbarara' },
    { id: 5, name: 'Cassava', price_per_unit: 1500, unit: 'kg', farmer: 'Fred Ochieng', quantity_available: 300, image: 'https://images.unsplash.com/photo-1598030343246-eec71cb44231?auto=format&fit=crop&w=400&q=80', location: 'Soroti' },
    { id: 6, name: 'Fresh Eggs', price_per_unit: 12000, unit: 'tray', farmer: 'Sarah Atim', quantity_available: 80, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80', location: 'Kampala' },
  ];
}

function getDemoSupplies() {
  return [
    { id: 1, name: 'Organic Pesticide', price: 25000, stock: 50, vendor: 'AgroTools Uganda', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', description: 'Natural pest control' },
    { id: 2, name: 'Heavy Duty Hoe', price: 35000, stock: 30, vendor: 'FarmEquip Ltd', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', description: 'Durable farming tool' },
    { id: 3, name: 'NPK Fertilizer (50kg)', price: 180000, stock: 100, vendor: 'Uganda Seeds', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80', description: 'Complete nutrition for crops' },
    { id: 4, name: 'Drip Irrigation Kit', price: 450000, stock: 15, vendor: 'IrriTech Uganda', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=400&q=80', description: 'Water-saving irrigation' },
  ];
}
