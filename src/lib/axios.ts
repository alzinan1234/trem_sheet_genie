import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.termsheetgenie.com/api/v1';

// Custom config type with skipAuth option
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    // যদি skipAuth true হয়, তাহলে Authorization header যোগ করবে না
    if (config.skipAuth) {
      return config;
    }
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Public routes যেগুলোতে 401 এলে redirect করব না
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/refresh-token',
  '/auth/logout',
  '/user/create-user',
  '/auth/send-otp-for-verify-email',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/verify-otp-for-forgot-password',
  '/auth/reset-password',
  '/auth/verify-login-otp',
  '/auth/toggle-2fa',
  '/auth/change-password',
  '/auth/session-info',
  '/auth/logout-all-devices',
  '/auth/me',
];

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Public route এ error হলে সরাসরি reject করো — loop নেই
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      originalRequest?.url?.includes(route)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.get('/auth/refresh-token');
        const newToken = response.data?.data?.access_token;

        if (newToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', newToken);
          }
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh fail করলে logout করো
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          // Login page এ redirect (refresh loop এড়াতে)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;