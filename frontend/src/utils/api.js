import axios from 'axios';

// Create a new instance of axios with a custom configuration
const api = axios.create({
  
  baseURL: 'http://localhost:5000',
  
  // Set default headers
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;