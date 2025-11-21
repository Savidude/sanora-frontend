import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getValidIdToken } from './auth';

// Get API URL from environment variable (set at build time from SSM)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.sanora.app/v1';

console.log('📡 API Client initialized with base URL:', API_BASE_URL);

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for automatic authorization header injection
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get valid ID token (automatically refreshes if needed)
      const token = await getValidIdToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get ID token:', error);
      // Continue with request even if token retrieval fails
      // The API will return 401 if authentication is required
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === 401) {
        console.error('Unauthorized: Token expired or invalid');
        // Redirect to login page
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Forbidden: Insufficient permissions');
      } else {
        console.error('API Error:', status, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received');
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
