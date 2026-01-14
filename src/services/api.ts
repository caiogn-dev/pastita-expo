import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import { secureStorage } from './storage';

// Create axios instance for store-specific endpoints
const storeApi: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/stores/s/${API_CONFIG.STORE_SLUG}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for auth endpoints
const authApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for global endpoints
const globalApi: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/stores`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken: string | null = null;

export const setAuthToken = async (token: string | null): Promise<void> => {
  authToken = token;
  if (token) {
    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  authToken = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return authToken;
};

export const clearAuthToken = async (): Promise<void> => {
  authToken = null;
  await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Request interceptor for store API
storeApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Request interceptor for auth API
authApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Request interceptor for global API
globalApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for error handling
const handleResponseError = (error: AxiosError) => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data);
    
    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      clearAuthToken();
    }
  } else if (error.request) {
    console.error('Network Error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
  return Promise.reject(error);
};

storeApi.interceptors.response.use((response) => response, handleResponseError);
authApi.interceptors.response.use((response) => response, handleResponseError);
globalApi.interceptors.response.use((response) => response, handleResponseError);

export { storeApi, authApi, globalApi };
export default storeApi;
