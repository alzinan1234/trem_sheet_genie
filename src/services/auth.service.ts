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
  // backend /user/create-user accepts: name, email, password
  const res = await apiClient.post('/user/create-user', payload);
  // Normalise: backend may return token as 'token' or 'verifyEmailToken' — unify
  const d = res.data?.data as any;
  if (d?.token && !d?.verifyEmailToken) {
    res.data.data = { ...d, verifyEmailToken: d.token };
  }
  return res.data;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (payload: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginResponse>> => {
  const res = await apiClient.post('/auth/login', payload);

  // Normal login — store tokens
  if (res.data?.data?.access_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
  }

  // 2FA response — backend may return { twoFactorRequired, preAuthToken } at data.data OR data level
  // Normalise so Login component always finds it at res.data level
  const inner = res.data?.data as any;
  if (inner?.twoFactorRequired || inner?.preAuthToken) {
    // Hoist 2FA fields to top-level data so component can read them
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
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
export const getMe = async (): Promise<ApiResponse<User>> => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

// ─── Send OTP for Email Verification ─────────────────────────────────────────
export const sendVerificationOTP = async (payload: {
  email: string;
}): Promise<ApiResponse<{ verifyEmailToken: string }>> => {
  const res = await apiClient.post('/auth/send-otp-for-verify-email', payload);
  // Normalise: backend may return { token } or { verifyEmailToken } — unify to verifyEmailToken
  const d = res.data?.data as any;
  if (d?.token && !d?.verifyEmailToken) {
    res.data.data = { ...d, verifyEmailToken: d.token };
  }
  return res.data;
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (payload: {
  otp: string;
  verifyEmailToken: string;
}): Promise<ApiResponse<VerifyEmailResponse>> => {
  // Backend reads token from 'token' header (not Authorization, not body)
  // Postman confirmed: header key = "token", value = verifyEmailToken
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
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (payload: {
  email: string;
}): Promise<ApiResponse<null>> => {
  const res = await apiClient.post('/auth/forgot-password', payload);
  return res.data;
};

// ─── Verify OTP for Forgot Password ──────────────────────────────────────────
export const verifyForgotPasswordOTP = async (payload: {
  otp: string;
  email: string;
}): Promise<ApiResponse<{ resetToken: string }>> => {
  const res = await apiClient.post('/auth/verify-otp-for-forgot-password', payload);
  return res.data;
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (payload: {
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}): Promise<ApiResponse<null>> => {
  const res = await apiClient.post('/auth/reset-password', payload);
  return res.data;
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<null>> => {
  const res = await apiClient.patch('/auth/change-password', payload);
  return res.data;
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (): Promise<ApiResponse<{ access_token: string }>> => {
  const res = await apiClient.get('/auth/refresh-token');
  if (res.data?.data?.access_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.data.data.access_token);
    }
  }
  return res.data;
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const res = await apiClient.post('/auth/logout');
    return res.data;
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
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }
};

// ─── Session Info ─────────────────────────────────────────────────────────────
export const getSessionInfo = async (): Promise<ApiResponse<SessionInfo>> => {
  const res = await apiClient.get('/auth/session-info');
  return res.data;
};

// ─── Toggle 2FA ───────────────────────────────────────────────────────────────
export const toggle2FA = async (): Promise<ApiResponse<{ isTwoFactorEnabled: boolean }>> => {
  const res = await apiClient.patch('/auth/toggle-2fa');
  return res.data;
};

// ─── Verify Login OTP (2FA) ───────────────────────────────────────────────────
export const verifyLoginOTP = async (payload: {
  otp: string;
  preAuthToken: string;
}): Promise<ApiResponse<LoginResponse>> => {
  const res = await apiClient.post('/auth/verify-login-otp', payload);
  if (res.data?.data?.access_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
  }
  return res.data;
};