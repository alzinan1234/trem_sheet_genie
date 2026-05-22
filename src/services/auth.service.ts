import apiClient from '@/lib/axios';
import {
  ApiResponse,
  RegisterResponse,
  LoginResponse,
  VerifyEmailResponse,
  User,
  SessionInfo,
} from '@/types';

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
        localStorage.setItem('access_token', res.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
      }
    }

    const inner = res.data?.data as any;
    if (inner?.twoFactorRequired || inner?.preAuthToken) {
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
    if (res.data?.data?.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', res.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
      }
    }
    return res.data;
  } catch (error: any) {
    console.error('Verify email error:', error);
    throw error;
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
// Step 1: ইমেইল দিলে ব্যাকএন্ড থেকে resetToken আসবে
export const forgotPassword = async (payload: {
  email: string;
}): Promise<ApiResponse<{ resetToken: string }>> => {
  try {
    console.log('📧 1. Forgot Password Request - Email:', payload.email);
    
    const res = await apiClient.post('/auth/forgot-password', payload);
    
    console.log('📦 1. Forgot Password Full Response:', res.data);
    
    // ব্যাকএন্ড থেকে resetToken আসছে কিনা চেক করুন
    if (res.data?.data?.resetToken && typeof window !== 'undefined') {
      const token = res.data.data.resetToken;
      sessionStorage.setItem('resetToken', token);
      console.log('✅ 1. Reset Token Saved to sessionStorage:', token);
      
      // Token ডিকোড করে expiry চেক করুন
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        console.log('⏰ 1. Token Expiry:', new Date(decoded.exp * 1000).toLocaleString());
        console.log('🕐 1. Current Time:', new Date().toLocaleString());
        const isExpired = decoded.exp * 1000 < Date.now();
        console.log('⚠️ 1. Is Token Expired?:', isExpired);
      } catch(e) {
        console.log('⚠️ 1. Could not decode token (maybe not JWT)');
      }
    } else {
      console.log('❌ 1. No resetToken in response!');
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ 1. Forgot password error:', error);
    throw error;
  }
};

// ─── Verify OTP for Forgot Password ──────────────────────────────────────────
// Step 2: OTP verify করলে ব্যাকএন্ড থেকে নতুন resetToken আসবে
export const verifyForgotPasswordOTP = async (payload: {
  otp: string;
  email: string;
}): Promise<ApiResponse<{ resetToken: string }>> => {
  try {
    // sessionStorage থেকে আগের resetToken নিন
    const storedToken = typeof window !== 'undefined' 
      ? sessionStorage.getItem('resetToken') 
      : null;
    
    console.log('🔑 2. Stored Reset Token from sessionStorage:', storedToken);
    console.log('📝 2. Verifying OTP:', payload.otp);
    console.log('📧 2. Email:', payload.email);
    
    if (!storedToken) {
      throw new Error('Reset token not found in sessionStorage. Please request OTP again.');
    }
    
    // Postman এর মতো Headers এ token পাঠান
    const res = await apiClient.post(
      '/auth/verify-otp-for-forgot-password',
      { otp: payload.otp }, // Body তে শুধু OTP
      {
        headers: {
          token: storedToken, // Header এ token
        },
        skipAuth: true,
      }
    );
    
    console.log('📦 2. Verify OTP Full Response:', res.data);
    
    // OTP সঠিক হলে ব্যাকএন্ড থেকে নতুন resetToken আসবে
    if (res.data?.data?.resetToken && typeof window !== 'undefined') {
      const newToken = res.data.data.resetToken;
      sessionStorage.setItem('resetToken', newToken);
      console.log('✅ 2. New Reset Token Saved to sessionStorage:', newToken);
      
      // নতুন টোকেনের expiry চেক করুন
      try {
        const base64Url = newToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        console.log('⏰ 2. New Token Expiry:', new Date(decoded.exp * 1000).toLocaleString());
      } catch(e) {
        console.log('⚠️ 2. Could not decode new token');
      }
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ 2. Verify OTP error:', error.response?.data || error);
    throw error;
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
// Step 3: নতুন পাসওয়ার্ড সেট করুন
export const resetPassword = async (payload: {
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}): Promise<ApiResponse<null>> => {
  try {
    console.log('🔑 3. Reset Token being used:', payload.resetToken);
    console.log('🔐 3. New Password:', payload.newPassword);
    
    // Postman এর মতো Headers এ token পাঠান, Body তে শুধু পাসওয়ার্ড
    const res = await apiClient.post(
      '/auth/reset-password',
      {
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
      },
      {
        headers: {
          token: payload.resetToken, // Header এ token
        },
        skipAuth: true,
      }
    );
    
    console.log('📦 3. Reset Password Full Response:', res.data);
    
    // সফল হলে sessionStorage থেকে token মুছে দিন
    if (res.data?.success && typeof window !== 'undefined') {
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetEmail');
      console.log('✅ 3. Reset successful! Tokens cleared from sessionStorage');
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
    const res = await apiClient.patch('/auth/change-password', payload);
    return res.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    throw error;
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (): Promise<ApiResponse<{ access_token: string }>> => {
  try {
    const res = await apiClient.get('/auth/refresh-token');
    if (res.data?.data?.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', res.data.data.access_token);
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
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
        localStorage.setItem('access_token', res.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
      }
    }
    return res.data;
  } catch (error: any) {
    console.error('Verify login OTP error:', error);
    throw error;
  }
};