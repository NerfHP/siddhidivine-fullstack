import axios from 'axios';
import { AuthTokens } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const tokensString = localStorage.getItem('authTokens');
    if (tokensString) {
      const tokens: AuthTokens = JSON.parse(tokensString);
      if (tokens.access?.token) {
        config.headers.Authorization = `Bearer ${tokens.access.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// TODO: Add response interceptor for refreshing token on 401 error

export default api;