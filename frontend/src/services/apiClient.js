import axios from 'axios';

// Configure Axios instance for real backend communication
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to requests if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
