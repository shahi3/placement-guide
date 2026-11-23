import axios from 'axios';
import { getToken, clearSession, loginPathFor } from '../utils/auth';

// Single source of truth for the backend URL (set VITE_API_URL in frontend/.env).
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008';

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

// /admin/... requests use the admin token, everything else the student token.
const roleForUrl = (url = '') => (url.startsWith('/admin') ? 'admin' : 'student');
const isLoginRequest = (url = '') => url.startsWith('/placementguide');

axiosInstance.interceptors.request.use((config) => {
  const token = getToken(roleForUrl(config.url));
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expired or invalid (the backend answers 401): clear it and send the user to log in again.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url;
    if (error.response?.status === 401 && !isLoginRequest(url)) {
      const role = roleForUrl(url);
      clearSession(role);
      window.location.assign(loginPathFor(role));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
