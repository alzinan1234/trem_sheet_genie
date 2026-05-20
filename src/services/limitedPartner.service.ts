import apiClient from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResponse,
  LimitedPartner,
  CreateLimitedPartnerPayload,
  PaginationParams,
} from '@/types';

// ─── Create Limited Partner ───────────────────────────────────────────────────
export const createLimitedPartner = async (
  payload: CreateLimitedPartnerPayload
): Promise<ApiResponse<LimitedPartner>> => {
  const res = await apiClient.post('/limited-partners', payload);
  return res.data;
};

// ─── Get All Limited Partners ─────────────────────────────────────────────────
export const getLimitedPartners = async (
  params?: PaginationParams & { fundId?: string }
): Promise<PaginatedResponse<LimitedPartner>> => {
  const res = await apiClient.get('/limited-partners', { params });
  return res.data;
};

// ─── Get Limited Partner By ID ────────────────────────────────────────────────
export const getLimitedPartnerById = async (
  id: string
): Promise<ApiResponse<LimitedPartner>> => {
  const res = await apiClient.get(`/limited-partners/${id}`);
  return res.data;
};

// ─── Update Limited Partner ───────────────────────────────────────────────────
export const updateLimitedPartner = async (
  id: string,
  payload: Partial<CreateLimitedPartnerPayload>
): Promise<ApiResponse<LimitedPartner>> => {
  const res = await apiClient.patch(`/limited-partners/${id}`, payload);
  return res.data;
};

// ─── Delete Limited Partner ───────────────────────────────────────────────────
export const deleteLimitedPartner = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/limited-partners/${id}`);
  return res.data;
};
