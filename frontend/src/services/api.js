import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.119.83:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
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

export default api; 