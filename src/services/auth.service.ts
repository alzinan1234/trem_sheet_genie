

import apiClient, { CustomAxiosRequestConfig } from '@/lib/axios';
import {
  ApiResponse,
  RegisterResponse,
  LoginResponse,
  VerifyEmailResponse,
  User,
  SessionInfo,
} from '@/types';

// ─── Cookie Helper Functions ─────────────────────────────────────────────────
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  if (process.env.NODE_ENV === 'production') {
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;Secure;SameSite=Lax`;
  }
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<RegisterResponse>> => {
  try {
    const res = await apiClient.post('/user/create-user', payload);
    const d = res.data?.data as any;
    if (d?.token && !d?.verifyEmailToken) {
      res.data.data = { ...d, verifyEmailToken: d.token };
    }
    return res.data;
  } catch (error: any) {
    console.error('Register error:', error);
    throw error;
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (payload: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginResponse>> => {
  try {
    const res = await apiClient.post('/auth/login', payload);

    if (res.data?.data?.access_token) {
      if (typeof window !== 'undefined') {
        setCookie('access_token', res.data.data.access_token, 7);
        setCookie('user', JSON.stringify(res.data.data.user), 7);
      }
    }

    const inner = res.data?.data as any;
    if (inner?.twoFactorRequired || inner?.preAuthToken) {
      if (inner?.preAuthToken && typeof window !== 'undefined') {
        setCookie('preAuthToken', inner.preAuthToken, 1);
      }
      return {
        ...res.data,
        data: {
          ...inner,
          twoFactorRequired: inner.twoFactorRequired,
          preAuthToken: inner.preAuthToken,
        } as any,
      };
    }

    return res.data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
export const getMe = async (): Promise<ApiResponse<User>> => {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch (error: any) {
    console.error('Get me error:', error);
    throw error;
  }
};

// ─── Send OTP for Email Verification ─────────────────────────────────────────
export const sendVerificationOTP = async (payload: {
  email: string;
}): Promise<ApiResponse<{ verifyEmailToken: string }>> => {
  try {
    const res = await apiClient.post('/auth/send-otp-for-verify-email', payload);
    const d = res.data?.data as any;
    if (d?.token && !d?.verifyEmailToken) {
      res.data.data = { ...d, verifyEmailToken: d.token };
    }
    return res.data;
  } catch (error: any) {
    console.error('Send verification OTP error:', error);
    throw error;
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (payload: {
  otp: string;
  verifyEmailToken: string;
}): Promise<ApiResponse<VerifyEmailResponse>> => {
  try {
    const res = await apiClient.post(
      '/auth/verify-email',
      { otp: payload.otp },
      {
        headers: {
          token: payload.verifyEmailToken,
        },
      }
    );

    // ✅ FIX: Postman response structure অনুযায়ী access_token আছে res.data.data তে
    const tokenData = res.data?.data as any;
    const accessToken = tokenData?.access_token;
    const user = tokenData?.user;

    if (accessToken && typeof window !== 'undefined') {
      setCookie('access_token', accessToken, 7);
      if (user) setCookie('user', JSON.stringify(user), 7);
    }

    return res.data;
  } catch (error: any) {
    console.error('Verify email error:', error);
    throw error;
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (payload: {
  email: string;
}): Promise<ApiResponse<{ resetToken: string }>> => {
  try {
    console.log('📧 1. Forgot Password Request - Email:', payload.email);
    
    const res = await apiClient.post('/auth/forgot-password', payload);
    
    console.log('📦 1. Forgot Password Full Response:', res.data);
    
    if (res.data?.data?.resetToken && typeof window !== 'undefined') {
      const token = res.data.data.resetToken;
      setCookie('resetToken', token, 1);
      console.log('✅ 1. Reset Token Saved to Cookie:', token.substring(0, 50) + '...');
      
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        console.log('⏰ 1. Token Expiry:', new Date(decoded.exp * 1000).toLocaleString());
      } catch(e) {
        console.log('⚠️ 1. Could not decode token');
      }
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ 1. Forgot password error:', error);
    throw error;
  }
};

// ─── Verify OTP for Forgot Password ──────────────────────────────────────────
export const verifyForgotPasswordOTP = async (payload: {
  otp: string;
  email: string;
}): Promise<ApiResponse<{ resetToken: string }>> => {
  try {
    const storedToken = getCookie('resetToken');
    
    console.log('🔑 2. Stored Reset Token from Cookie:', storedToken?.substring(0, 50) + '...');
    console.log('📝 2. Verifying OTP:', payload.otp);
    
    if (!storedToken) {
      throw new Error('Reset token not found. Please request OTP again.');
    }
    
    const res = await apiClient.post(
      '/auth/verify-otp-for-forgot-password',
      { otp: payload.otp },
      {
        headers: {
          token: storedToken,
        },
        skipAuth: true,
      } as unknown as CustomAxiosRequestConfig
    );
    
    console.log('📦 2. Verify OTP Response:', res.data);
    
    if (res.data?.data?.resetToken && typeof window !== 'undefined') {
      const newToken = res.data.data.resetToken;
      setCookie('resetToken', newToken, 1);
      console.log('✅ 2. New Reset Token Saved to Cookie');
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ 2. Verify OTP error:', error.response?.data || error);
    throw error;
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (payload: {
  newPassword: string;
  confirmPassword: string;
  resetToken?: string;
}): Promise<ApiResponse<null>> => {
  try {
    let resetToken = payload.resetToken || getCookie('resetToken');
    
    console.log('🔄 3. Reset Password - Token:', resetToken?.substring(0, 50) + '...');
    
    if (!resetToken) {
      throw new Error('Reset token not found. Please request password reset again.');
    }
    
    resetToken = resetToken.trim();

    const res = await apiClient.post(
      '/auth/reset-password',
      {
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
      },
      {
        headers: {
          token: resetToken,
        },
        skipAuth: true,
      } as unknown as CustomAxiosRequestConfig
    );
    
    console.log('✅ 3. Reset Password Success:', res.data);
    
    if (res.data?.success && typeof window !== 'undefined') {
      removeCookie('resetToken');
      removeCookie('resetEmail');
      console.log('✅ 3. Reset successful! Tokens cleared');
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ 3. Reset password error:', error.response?.data || error);
    throw error;
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<null>> => {
  try {
    console.log('🔄 Change Password Request - Using access_token from cookie');
    
    const res = await apiClient.patch('/auth/change-password', payload);
    
    console.log('✅ Change Password Success:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Change password error:', error.response?.data || error);
    throw error;
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (): Promise<ApiResponse<{ access_token: string }>> => {
  try {
    const res = await apiClient.get('/auth/refresh-token');
    if (res.data?.data?.access_token) {
      if (typeof window !== 'undefined') {
        setCookie('access_token', res.data.data.access_token, 7);
      }
    }
    return res.data;
  } catch (error: any) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  } finally {
    if (typeof window !== 'undefined') {
      removeCookie('access_token');
      removeCookie('user');
      removeCookie('preAuthToken');
      removeCookie('resetToken');
      removeCookie('resetEmail');
    }
  }
};

// ─── Logout All Devices ───────────────────────────────────────────────────────
export const logoutAllDevices = async (): Promise<ApiResponse<null>> => {
  try {
    const res = await apiClient.post('/auth/logout-all-devices');
    return res.data;
  } catch (error: any) {
    console.error('Logout all devices error:', error);
    throw error;
  } finally {
    if (typeof window !== 'undefined') {
      removeCookie('access_token');
      removeCookie('user');
      removeCookie('preAuthToken');
      removeCookie('resetToken');
      removeCookie('resetEmail');
    }
  }
};

// ─── Session Info ─────────────────────────────────────────────────────────────
export const getSessionInfo = async (): Promise<ApiResponse<SessionInfo>> => {
  try {
    const res = await apiClient.get('/auth/session-info');
    return res.data;
  } catch (error: any) {
    console.error('Get session info error:', error);
    throw error;
  }
};

// ─── Toggle 2FA ───────────────────────────────────────────────────────────────
export const toggle2FA = async (): Promise<ApiResponse<{ isTwoFactorEnabled: boolean }>> => {
  try {
    const res = await apiClient.patch('/auth/toggle-2fa');
    return res.data;
  } catch (error: any) {
    console.error('Toggle 2FA error:', error);
    throw error;
  }
};

// ─── Verify Login OTP (2FA) ───────────────────────────────────────────────────
export const verifyLoginOTP = async (payload: {
  otp: string;
  preAuthToken: string;
}): Promise<ApiResponse<LoginResponse>> => {
  try {
    const res = await apiClient.post('/auth/verify-login-otp', payload);
    if (res.data?.data?.access_token) {
      if (typeof window !== 'undefined') {
        setCookie('access_token', res.data.data.access_token, 7);
        setCookie('user', JSON.stringify(res.data.data.user), 7);
        removeCookie('preAuthToken');
      }
    }
    return res.data;
  } catch (error: any) {
    console.error('Verify login OTP error:', error);
    throw error;
  }
};

// ─── Utility Functions for Cookie Access ─────────────────────────────────────
export const getAccessTokenFromCookie = (): string | null => {
  return getCookie('access_token');
};

export const getUserFromCookie = (): User | null => {
  const userStr = getCookie('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getPreAuthTokenFromCookie = (): string | null => {
  return getCookie('preAuthToken');
};

export const getResetTokenFromCookie = (): string | null => {
  return getCookie('resetToken');
};

export const isAuthenticated = (): boolean => {
  return !!getCookie('access_token');
};