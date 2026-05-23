import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.termsheetgenie.com/api/v1';

// Custom config type with skipAuth option
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

console.log("API BASE URL =", BASE_URL);

// ─── Cookie Helper Functions ─────────────────────────────────────────────────
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  // production এ secure flag
  if (process.env.NODE_ENV === 'production') {
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;Secure;SameSite=Lax`;
  }
};

const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

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
      // কুকি থেকে টোকেন নিন
      const token = getCookie('access_token');
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
            // কুকিতে নতুন টোকেন সেট করুন
            setCookie('access_token', newToken, 7);
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
          // সব কুকি清除 করুন
          removeCookie('access_token');
          removeCookie('user');
          removeCookie('preAuthToken');
          removeCookie('resetToken');
          removeCookie('resetEmail');
          
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

export type { CustomAxiosRequestConfig };

// ─── Export Cookie Helpers for use in other files ────────────────────────────
export { getCookie, setCookie, removeCookie };