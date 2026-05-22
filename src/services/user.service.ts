import apiClient from '@/lib/axios';
import { ApiResponse, User, PaginatedResponse } from '@/types';

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getMyProfile = async (): Promise<ApiResponse<User>> => {
  const res = await apiClient.get('/user/get-me');
  return res.data;
};

// ─── Update My Profile (JSON body) ───────────────────────────────────────────
// API accepts: { firstName, lastName, phoneNumber, avatarTempMediaId }
export const updateMyProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  username?: string;
  avatarTempMediaId?: string;
}): Promise<ApiResponse<User>> => {
  const res = await apiClient.put('/user/update-me', payload);
  return res.data;
};

// ─── Update Avatar (upload temp media first, then update profile) ─────────────
// Step 1: upload file to /temp-media/upload → get tempMediaId
// Step 2: call updateMyProfile with avatarTempMediaId
export const updateAvatar = async (profileImage: File): Promise<ApiResponse<User>> => {
  // Step 1: Upload to temp-media
  const formData = new FormData();
  formData.append('file', profileImage);
  formData.append('context', 'avatar');
  const uploadRes = await apiClient.post('/temp-media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const tempMediaId: string = uploadRes.data?.data?.id ?? uploadRes.data?.data?._id;

  // Step 2: Update profile with the temp media ID
  const res = await apiClient.put('/user/update-me', { avatarTempMediaId: tempMediaId });
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