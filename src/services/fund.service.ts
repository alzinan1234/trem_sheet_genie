import apiClient from '@/lib/axios';
import { ApiResponse, PaginatedResponse, Fund, CreateFundPayload, PaginationParams } from '@/types';

// ─── Create Fund ──────────────────────────────────────────────────────────────
export const createFund = async (payload: CreateFundPayload): Promise<ApiResponse<Fund>> => {
  const res = await apiClient.post('/funds', payload);
  return res.data;
};

// ─── Get All Funds ────────────────────────────────────────────────────────────
export const getFunds = async (params?: PaginationParams): Promise<PaginatedResponse<Fund>> => {
  const res = await apiClient.get('/funds', { params });
  return res.data;
};

// ─── Get Fund By ID ───────────────────────────────────────────────────────────
export const getFundById = async (id: string): Promise<ApiResponse<Fund>> => {
  const res = await apiClient.get(`/funds/${id}`);
  return res.data;
};

// ─── Update Fund ──────────────────────────────────────────────────────────────
export const updateFund = async (
  id: string,
  payload: Partial<CreateFundPayload>
): Promise<ApiResponse<Fund>> => {
  const res = await apiClient.patch(`/funds/${id}`, payload);
  return res.data;
};

// ─── Delete Fund ──────────────────────────────────────────────────────────────
export const deleteFund = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/funds/${id}`);
  return res.data;
};
