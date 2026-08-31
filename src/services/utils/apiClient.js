import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let pendingQueue = [];

let authHandlers = {
  getAccessToken: null, // () => string | null
  getRefreshToken: null, // () => string | null
  onRefreshToken: null, // () => Promise<string> resolves new accessToken
  onLogout: null, // () => void
};

export function setAuthHandlers(handlers) {
  authHandlers = { ...authHandlers, ...handlers };
}

function subscribeTokenRefresh(callback) {
  pendingQueue.push(callback);
}

function onRefreshed(newAccessToken) {
  pendingQueue.forEach((cb) => cb(newAccessToken));
  pendingQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken ? authHandlers.getAccessToken() : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;

    // Non-401 or no refresh handler → forward
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Avoid refresh recursion for auth endpoints
    if (originalRequest.url && (
      String(originalRequest.url).includes('/auth/refresh-token') ||
      String(originalRequest.url).includes('/auth/login') ||
      String(originalRequest.url).includes('/auth/register')
    )) {
      return Promise.reject(error);
    }

    if (!authHandlers.onRefreshToken) {
      if (authHandlers.onLogout) authHandlers.onLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const newAccessToken = await authHandlers.onRefreshToken();
      onRefreshed(newAccessToken);
      const headers = originalRequest.headers || {};
      headers.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers = headers;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      if (authHandlers.onLogout) authHandlers.onLogout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;


