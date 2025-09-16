import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:3000';

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos para as requisições
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  pix_key?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    stellar_public_key: string;
  };
}

// Serviços de autenticação
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },
};

// Serviços do motorista
export const motoristaService = {
  gerarCreditos: async (amount: number = 10) => {
    const response = await api.post('/motorista/gerar-creditos-eco', { amount });
    return response.data;
  },

  trocarCdrPorPix: async (amount: number) => {
    const response = await api.post('/motorista/trocar-cdr-por-pix', { amount });
    return response.data;
  },
};

// Serviços do admin
export const adminService = {
  listarUsuarios: async () => {
    const response = await api.get('/admin/usuarios');
    return response.data;
  },

  gerarCreditos: async (userId: number, amount: number) => {
    const response = await api.post('/admin/gerar-creditos', { userId, amount });
    return response.data;
  },
};

// Utilitários
export const apiUtils = {
  setAuthToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  setUserData: (userData: any) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default api;