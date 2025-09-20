// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  user_type: string;
  stellar_public_key: string;
  pix_key?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  pixKey: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Dashboard Types
export interface DashboardData {
  name: string;
  cdriveBalance: number;
  pixValue: number;
  monthSavings: number;
  ecoScore: number;
}

export interface ActivityItem {
  id: number;
  type: 'earning' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
}

export interface ChartData {
  day: string;
  earnings: number;
}

// Trip Types
export interface TripData {
  id: string;
  startTime: Date;
  endTime?: Date;
  distance: number;
  carbonSaved: number;
  tokensEarned: number;
  ecoScore: number;
  isActive: boolean;
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Settings: undefined;
  TripSimulation: undefined;
  Withdraw: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Rewards: undefined;
  Profile: undefined;
};

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Notification Types
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'trip_completed' | 'reward_earned' | 'withdrawal_processed' | 'general';
  data?: any;
  timestamp: number;
  read: boolean;
}
