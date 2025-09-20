import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LoginCredentials, 
  SignupData, 
  AuthResponse, 
  DashboardData, 
  ActivityItem, 
  ChartData,
  ApiResponse 
} from '../types';

// Configure base URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001' 
  : 'https://your-production-api.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      // Navigate to login screen (handled by auth context)
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  },

  getProfile: async (): Promise<any> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<any>): Promise<any> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getActivityFeed: async (): Promise<ActivityItem[]> => {
    const response = await api.get('/dashboard/activity');
    return response.data;
  },

  getChartData: async (): Promise<ChartData[]> => {
    const response = await api.get('/dashboard/chart');
    return response.data;
  },
};

// Trip API
export const tripApi = {
  startTrip: async (): Promise<any> => {
    const response = await api.post('/motorista/eco-conducao');
    return response.data;
  },

  endTrip: async (tripId: string): Promise<any> => {
    const response = await api.post(`/motorista/trip/${tripId}/end`);
    return response.data;
  },

  getTrips: async (): Promise<any[]> => {
    const response = await api.get('/motorista/trips');
    return response.data;
  },

  getTripHistory: async (page = 1, limit = 20): Promise<any> => {
    const response = await api.get(`/motorista/trips?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Rewards API
export const rewardsApi = {
  withdrawToPix: async (amount: number): Promise<any> => {
    const response = await api.post('/motorista/trocar-cdr-por-pix', { amount });
    return response.data;
  },

  getRewardHistory: async (): Promise<any[]> => {
    const response = await api.get('/motorista/rewards');
    return response.data;
  },
};

// Location API
export const locationApi = {
  updateLocation: async (location: { latitude: number; longitude: number }): Promise<void> => {
    await api.post('/location/update', location);
  },

  getLocationHistory: async (): Promise<any[]> => {
    const response = await api.get('/location/history');
    return response.data;
  },
};

// OBD-II API
export const obdApi = {
  sendObdData: async (data: {
    tripId: string;
    timestamp: number;
    rpm: number;
    maf: number;
    speed: number;
    throttle: number;
    engineLoad: number;
    fuelLevel: number;
    coolantTemp: number;
    latitude?: number;
    longitude?: number;
  }): Promise<void> => {
    await api.post('/obd/data_stream', data);
  },

  sendObdBatch: async (dataArray: Array<{
    tripId: string;
    timestamp: number;
    rpm: number;
    maf: number;
    speed: number;
    throttle: number;
    engineLoad: number;
    fuelLevel: number;
    coolantTemp: number;
    latitude?: number;
    longitude?: number;
  }>): Promise<void> => {
    await api.post('/obd/data_batch', { data: dataArray });
  },

  getObdHistory: async (tripId: string): Promise<any[]> => {
    const response = await api.get(`/obd/history/${tripId}`);
    return response.data;
  },

  getObdAnalytics: async (tripId: string): Promise<any> => {
    const response = await api.get(`/obd/analytics/${tripId}`);
    return response.data;
  },
};

export default api;
