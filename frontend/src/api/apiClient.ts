import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Standardized Web Hatchery Axios instance.
 * Attaches Bearer token from persisted auth state and handles 401 redirects.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      if (!authStorageStr) return config;

      const authData = JSON.parse(authStorageStr) as { state?: { token?: string } };
      const token = authData?.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to parse auth token from local storage', error);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const responseData = error.response?.data as { login_url?: string } | undefined;
      const loginUrl = responseData?.login_url || import.meta.env.VITE_WEB_HATCHERY_LOGIN_URL;

            if (loginUrl) {
        window.location.assign(loginUrl);
      }
    }

    return Promise.reject(error);
  }
);
