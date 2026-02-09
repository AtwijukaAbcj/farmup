import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  refreshToken: () => api.post('/auth/refresh'),
};

// Farmers API
export const farmersAPI = {
  getAll: (params) => api.get('/farmers', { params }),
  getById: (id) => api.get(`/farmers/${id}`),
  create: (farmerData) => api.post('/farmers', farmerData),
  update: (id, farmerData) => api.put(`/farmers/${id}`, farmerData),
  delete: (id) => api.delete(`/farmers/${id}`),
  verify: (id) => api.put(`/farmers/${id}/verify`),
  updateStatus: (id, status, comments) => api.put(`/farmers/${id}/status`, { status, comments }),
  getStats: () => api.get('/farmers/stats/summary'),
};

// Loans API
export const loansAPI = {
  getAll: (params) => api.get('/loans', { params }),
  getById: (id) => api.get(`/loans/${id}`),
  create: (loanData) => api.post('/loans', loanData),
  update: (id, loanData) => api.put(`/loans/${id}`, loanData),
  updateStatus: (id, status, comments, approvedAmount) => 
    api.put(`/loans/${id}/status`, { status, comments, approvedAmount }),
  disburse: (id, disbursementData) => api.post(`/loans/${id}/disburse`, disbursementData),
  recordPayment: (id, paymentData) => api.post(`/loans/${id}/payment`, paymentData),
  getStats: () => api.get('/loans/stats/summary'),
};

// Activities API
export const activitiesAPI = {
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (activityData) => api.post('/activities', activityData),
  update: (id, activityData) => api.put(`/activities/${id}`, activityData),
  delete: (id) => api.delete(`/activities/${id}`),
  getByFarmer: (farmerId) => api.get(`/activities/farmer/${farmerId}`),
  getStats: () => api.get('/activities/stats/summary'),
};

// Land API
export const landAPI = {
  getAll: (params) => api.get('/land', { params }),
  getById: (id) => api.get(`/land/${id}`),
  create: (landData) => api.post('/land', landData),
  update: (id, landData) => api.put(`/land/${id}`, landData),
  delete: (id) => api.delete(`/land/${id}`),
  getByFarmer: (farmerId) => api.get(`/land/farmer/${farmerId}`),
  getNearby: (latitude, longitude, maxDistance) => 
    api.get('/land/nearby', { params: { latitude, longitude, maxDistance } }),
  getStats: () => api.get('/land/stats/summary'),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getTrends: (period, type) => api.get('/dashboard/trends', { params: { period, type } }),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getRecentActivities: (limit) => api.get('/dashboard/recent-activities', { params: { limit } }),
  getAlerts: () => api.get('/dashboard/alerts'),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
};

export default api;