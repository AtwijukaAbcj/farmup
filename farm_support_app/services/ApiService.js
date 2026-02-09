import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Django backend URL - Update this to match your Django server
// Using network IP address for cross-device connectivity
const BASE_URL = 'http://192.168.1.31:8000';

class ApiService {
  // Seller Profile APIs
  async createOrUpdateSellerProfile(profileData, isFormData = false) {
    try {
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await this.api.post('/api/marketplace/seller-profile/', profileData, config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Seller profile error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to create/update seller profile' };
    }
  }
    async getProductCategories(isSupply = null) {
      try {
        let url = '/api/marketplace/categories/';
        if (isSupply !== null) {
          url += `?is_supply=${isSupply ? 'true' : 'false'}`;
        }
        const response = await this.api.get(url);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Get categories error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || 'Failed to fetch categories' };
      }
    }
  // Marketplace APIs
  async addMarketplaceProduce(produceData, isFormData=false) {
    try {
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await this.api.post('/api/marketplace/produce/', produceData, config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Add produce error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to add produce' };
    }
  }

  async addMarketplaceSupply(supplyData, isFormData=false) {
    try {
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await this.api.post('/api/marketplace/supplies/', supplyData, config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Add supply error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to add supply' };
    }
  }

  async getMarketplaceProduce() {
    try {
      const response = await this.api.get('/api/marketplace/produce/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get produce error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to fetch produce' };
    }
  }

  async getMarketplaceSupplies() {
    try {
      const response = await this.api.get('/api/marketplace/supplies/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get supplies error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to fetch supplies' };
    }
  }

  // Delete a produce item
  async deleteMarketplaceProduce(produceId) {
    try {
      await this.api.delete(`/api/marketplace/produce/${produceId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete produce error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to delete produce' };
    }
  }

  // Delete a supply item
  async deleteMarketplaceSupply(supplyId) {
    try {
      await this.api.delete(`/api/marketplace/supplies/${supplyId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete supply error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to delete supply' };
    }
  }

  // Create an order for produce
  async createProduceOrder(orderData) {
    try {
      const response = await this.api.post('/api/marketplace/orders/', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create order error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to create order' };
    }
  }

  // Create an order for supplies
  async createSupplyOrder(orderData) {
    try {
      const response = await this.api.post('/api/marketplace/supply-orders/', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create supply order error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to create supply order' };
    }
  }

  // Get user's orders
  async getMyOrders() {
    try {
      const response = await this.api.get('/api/marketplace/orders/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get orders error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Failed to fetch orders' };
    }
  }
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // Increased timeout to 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(username, password) {
    try {
      console.log('Attempting login to:', BASE_URL + '/api/auth/login/');
      console.log('Login credentials:', { username, password });
      const response = await this.api.post('/api/auth/login/', {
        username,
        password,
      });
      
      const { tokens, user } = response.data;
      
      // Store tokens
      await AsyncStorage.setItem('access_token', tokens.access);
      await AsyncStorage.setItem('refresh_token', tokens.refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return { success: true, user, tokens };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register/', userData);
      const { tokens, user } = response.data;
      
      // Store tokens
      await AsyncStorage.setItem('access_token', tokens.access);
      await AsyncStorage.setItem('refresh_token', tokens.refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return { success: true, user, tokens };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  }

  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await this.api.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear stored data
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      await AsyncStorage.setItem('access_token', access);
      
      return access;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  }

  // Farmers APIs
  async getFarmers(params = {}) {
    try {
      const response = await this.api.get('/api/farmers/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get farmers error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch farmers' };
    }
  }

  async createFarmer(farmerData) {
    try {
      const response = await this.api.post('/api/farmers/', farmerData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create farmer error:', error);
      return { success: false, error: error.response?.data || 'Failed to create farmer' };
    }
  }

  async getFarmer(farmerId) {
    try {
      const response = await this.api.get(`/api/farmers/${farmerId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get farmer error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch farmer' };
    }
  }

  async updateFarmer(farmerId, farmerData) {
    try {
      const response = await this.api.put(`/api/farmers/${farmerId}/`, farmerData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update farmer error:', error);
      return { success: false, error: error.response?.data || 'Failed to update farmer' };
    }
  }

  // Loans APIs
  async getLoans(params = {}) {
    try {
      const response = await this.api.get('/api/loans/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get loans error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch loans' };
    }
  }

  async createLoan(loanData) {
    try {
      const response = await this.api.post('/api/loans/', loanData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create loan error:', error);
      return { success: false, error: error.response?.data || 'Failed to create loan' };
    }
  }

  async getLoan(loanId) {
    try {
      const response = await this.api.get(`/api/loans/${loanId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get loan error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch loan' };
    }
  }

  async getMyLoans() {
    try {
      const currentUser = await this.getCurrentUser();
      const response = await this.api.get('/api/loans/', { 
        params: { farmer: currentUser?.id } 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get my loans error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch loans' };
    }
  }

  // Activities APIs
  async createActivity(activityData) {
    try {
      const response = await this.api.post('/api/activities/', activityData);
      return { success: true, data: response.data };
    } catch (error) {
      let errorMsg = 'Failed to create activity';
      if (error.response) {
        // Try to get JSON error, else fallback to text/html
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data) {
          errorMsg = JSON.stringify(error.response.data);
        }
        // If still HTML, try to get a snippet
        if (errorMsg.startsWith('<!DOCTYPE') || errorMsg.startsWith('<html')) {
          errorMsg = errorMsg.slice(0, 200) + '...';
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      console.error('Create activity error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  async getActivities(params = {}) {
    try {
      const response = await this.api.get('/api/activities/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get activities error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch activities' };
    }
  }

  // Land Entry APIs
  async createLandEntry(landData) {
    try {
      const response = await this.api.post('/api/land/', landData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create land entry error:', error);
      return { success: false, error: error.response?.data || 'Failed to create land entry' };
    }
  }

  async getLandEntries(params = {}) {
    try {
      const response = await this.api.get('/api/land/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get land entries error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch land entries' };
    }
  }

  // Dashboard APIs
  async getDashboardStats() {
    try {
      const [farmersResponse, loansResponse] = await Promise.all([
        this.api.get('/api/farmers/stats/'),
        this.api.get('/api/loans/stats/')
      ]);
      
      return {
        success: true,
        data: {
          farmers: farmersResponse.data,
          loans: loansResponse.data
        }
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return { success: false, error: 'Failed to fetch dashboard stats' };
    }
  }

  async getMyDashboardStats() {
    try {
      const currentUser = await this.getCurrentUser();
      const [myLoansResponse] = await Promise.all([
        this.api.get('/api/loans/', { params: { farmer: currentUser?.id } })
      ]);
      
      const loans = myLoansResponse.data.results || myLoansResponse.data || [];
      
      return {
        success: true,
        data: {
          my_loans: {
            total: loans.length,
            pending: loans.filter(loan => loan.status === 'pending').length,
            approved: loans.filter(loan => loan.status === 'approved').length,
            disbursed: loans.filter(loan => loan.status === 'disbursed').length,
          }
        }
      };
    } catch (error) {
      console.error('Get my dashboard stats error:', error);
      return { success: false, error: 'Failed to fetch my stats' };
    }
  }

  // Upload farmer document (e.g. selfie)
  async uploadFarmerDocument(farmerId, formData) {
    try {
      const response = await this.api.post(`/api/farmers/${farmerId}/documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Upload farmer document error:', error);
      return { success: false, error: error.response?.data || 'Failed to upload document' };
    }
  }

  // Animals APIs
  async getAnimals(params = {}) {
    try {
      const response = await this.api.get('/api/animals/animals/', { params });
      return { success: true, data: response.data.results || response.data };
    } catch (error) {
      console.error('Get animals error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch animals' };
    }
  }

  async getAnimalById(animalId) {
    try {
      const response = await this.api.get(`/api/animals/animals/${animalId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get animal error:', error);
      return { success: false, error: error.response?.data || 'Failed to fetch animal' };
    }
  }

  async createAnimal(animalData) {
    try {
      // Get current user to set farmer
      const currentUser = await this.getCurrentUser();
      const dataToSend = {
        ...animalData,
        farmer: currentUser?.farmer_id || currentUser?.id
      };

      const response = await this.api.post('/api/animals/animals/', dataToSend);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create animal error:', error);
      return { 
        success: false, 
        error: error.response?.data || 'Failed to register animal' 
      };
    }
  }

  async updateAnimal(animalId, animalData) {
    try {
      const response = await this.api.put(`/api/animals/animals/${animalId}/`, animalData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update animal error:', error);
      return { success: false, error: error.response?.data || 'Failed to update animal' };
    }
  }

  async deleteAnimal(animalId) {
    try {
      await this.api.delete(`/api/animals/animals/${animalId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete animal error:', error);
      return { success: false, error: error.response?.data || 'Failed to delete animal' };
    }
  }

  async getAnimalStats() {
    try {
      const response = await this.api.get('/api/animals/animals/stats/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get animal stats error:', error);
      return { success: false, error: 'Failed to fetch animal stats' };
    }
  }

  async scanRFID(rfidTag) {
    try {
      const response = await this.api.get('/api/animals/animals/scan/', {
        params: { rfid_tag: rfidTag }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Scan RFID error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'RFID tag not found' 
      };
    }
  }

  // Animal Health Records APIs
  async getAnimalHealthRecords(animalId) {
    try {
      const response = await this.api.get('/api/animals/health-records/', {
        params: { animal_id: animalId }
      });
      return { success: true, data: response.data.results || response.data };
    } catch (error) {
      console.error('Get health records error:', error);
      return { success: false, error: 'Failed to fetch health records' };
    }
  }

  async addAnimalHealthRecord(animalId, recordData) {
    try {
      const response = await this.api.post(
        `/api/animals/animals/${animalId}/add_health_record/`,
        recordData
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Add health record error:', error);
      return { 
        success: false, 
        error: error.response?.data || 'Failed to add health record' 
      };
    }
  }

  async getHealthRecordById(recordId) {
    try {
      const response = await this.api.get(`/api/animals/health-records/${recordId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get health record error:', error);
      return { success: false, error: 'Failed to fetch health record' };
    }
  }

  async updateHealthRecord(recordId, recordData) {
    try {
      const response = await this.api.put(`/api/animals/health-records/${recordId}/`, recordData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update health record error:', error);
      return { success: false, error: 'Failed to update health record' };
    }
  }

  async deleteHealthRecord(recordId) {
    try {
      await this.api.delete(`/api/animals/health-records/${recordId}/`);
      return { success: true };
    } catch (error) {
      console.error('Delete health record error:', error);
      return { success: false, error: 'Failed to delete health record' };
    }
  }
}

export default new ApiService();