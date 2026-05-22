import apiClient from '@/lib/axios';
import { ApiResponse, User, PaginatedResponse } from '@/types';

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getMyProfile = async (): Promise<ApiResponse<User>> => {
  const res = await apiClient.get('/user/get-me');
  return res.data;
};

// ─── Update My Profile (JSON body) ───────────────────────────────────────────
export const updateMyProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  username?: string;
  avatarTempMediaId?: string;
}): Promise<ApiResponse<User>> => {
  const res = await apiClient.put('/user/update-me', payload);
  if (res.data?.success && res.data?.data) {
    localStorage.setItem('user', JSON.stringify(res.data.data));
    window.dispatchEvent(new CustomEvent('user:updated', { detail: res.data.data }));
  }
  return res.data;
};

// ─── Update Avatar ────────────────────────────────────────────────────────────
export const updateAvatar = async (profileImage: File): Promise<ApiResponse<User>> => {
  // ── Step 1: upload to temp-media ─────────────────────────────────────────
  const formData = new FormData();
  formData.append('file', profileImage);
  formData.append('context', 'avatar');

  const uploadRes = await apiClient.post('/temp-media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // Log full response so you can see exact shape in browser console
  console.log('[updateAvatar] temp-media upload full response:', JSON.stringify(uploadRes.data));

  // Try every possible nesting the API might use
  const d = uploadRes.data;
  const tempMediaId: string =
    d?.data?.id ??
    d?.data?._id ??
    d?.data?.tempMediaId ??
    d?.data?.mediaId ??
    d?.id ??
    d?._id ??
    d?.tempMediaId ??
    d?.mediaId;

  console.log('[updateAvatar] extracted tempMediaId:', tempMediaId);

  if (!tempMediaId) {
    // Show the actual API response shape in the error so you can fix it
    throw new Error(
      `Avatar upload failed: could not find ID in response. Response was: ${JSON.stringify(d)}`
    );
  }

  // ── Step 2: update profile with avatarTempMediaId ────────────────────────
  const res = await apiClient.put('/user/update-me', { avatarTempMediaId: tempMediaId });

  if (res.data?.success && res.data?.data) {
    localStorage.setItem('user', JSON.stringify(res.data.data));
    window.dispatchEvent(new CustomEvent('user:updated', { detail: res.data.data }));
  }

  return res.data;
};

// ─── Delete My Account ────────────────────────────────────────────────────────
export const deleteMyAccount = async (): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete('/user/delete-me');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  return res.data;
};

// ─── Admin: Get All Users ─────────────────────────────────────────────────────
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const res = await apiClient.get('/user/get-all-users', { params });
  return res.data;
};

// ─── Admin: Get All Admins ────────────────────────────────────────────────────
export const getAllAdmins = async (): Promise<PaginatedResponse<User>> => {
  const res = await apiClient.get('/user/get-admin');
  return res.data;
};

// ─── Admin: Get User By ID ────────────────────────────────────────────────────
export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  const res = await apiClient.get(`/user/get-user/${id}`);
  return res.data;
};

// ─── Admin: Update User By ID ─────────────────────────────────────────────────
export const updateUserById = async (
  id: string,
  payload: Partial<User>
): Promise<ApiResponse<User>> => {
  const res = await apiClient.put(`/user/update-user/${id}`, payload);
  return res.data;
};

// ─── Admin: Block/Unblock User ────────────────────────────────────────────────
export const blockUnblockUser = async (id: string): Promise<ApiResponse<User>> => {
  const res = await apiClient.patch(`/user/block-unblock-user/${id}`);
  return res.data;
};

// ─── Admin: Delete User By ID ─────────────────────────────────────────────────
export const deleteUserById = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/user/delete-user/${id}`);
  return res.data;
};