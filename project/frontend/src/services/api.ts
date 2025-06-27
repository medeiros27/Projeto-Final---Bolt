import axios from 'axios';

// **CORREÇÃO: Adicionando o prefixo /api para corresponder ao backend**
const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  timeout: 10000,
});

// Interceptador para adicionar o token JWT a todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Erro na chamada da API:", error.message);
    return Promise.reject(error);
  }
);

export default api;
