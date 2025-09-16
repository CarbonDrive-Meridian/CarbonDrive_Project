import axios from 'axios';

// Configuração base da API usando a variável de ambiente do Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Adicionado timeout de 10 segundos para requisições
});

// Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt'); // Mantém o seu 'jwt' para consistência
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros de forma global
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token estiver expirado ou a requisição for 401, remove o token e redireciona
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      // Em uma aplicação real, você usaria um router para redirecionar
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;