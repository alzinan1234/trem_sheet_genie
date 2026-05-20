import apiClient from '@/lib/axios';
import { ApiResponse, User, PaginatedResponse } from '@/types';

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getMyProfile = async (): Promise<ApiResponse<User>> => {
  const res = await apiClient.get('/user/get-me');
  return res.data;
};

// ─── Update My Profile (form-data: profileImage file + data JSON) ─────────────
export const updateMyProfile = async (payload: {
  data?: Partial<Pick<User, 'firstName' | 'lastName' | 'phoneNumber' | 'username'>>;
  profileImage?: File;
}): Promise<ApiResponse<User>> => {
  const formData = new FormData();
  if (payload.profileImage) {
    formData.append('profileImage', payload.profileImage);
  }
  if (payload.data) {
    formData.append('data', JSON.stringify(payload.data));
  }
  const res = await apiClient.put('/user/update-me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ─── Update Avatar ────────────────────────────────────────────────────────────
export const updateAvatar = async (profileImage: File): Promise<ApiResponse<User>> => {
  const formData = new FormData();
  formData.append('profileImage', profileImage);
  formData.append('data', JSON.stringify({}));
  const res = await apiClient.put('/user/update-me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
