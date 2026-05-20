import apiClient from '@/lib/axios';
import { ApiResponse, PaginatedResponse, Startup, CreateStartupPayload, PaginationParams } from '@/types';

export const createStartup = async (payload: CreateStartupPayload): Promise<ApiResponse<Startup>> => {
  const res = await apiClient.post('/startups', payload);
  return res.data;
};

export const getStartups = async (
  params?: PaginationParams & { fundId?: string; status?: string }
): Promise<PaginatedResponse<Startup>> => {
  const res = await apiClient.get('/startups', { params });
  return res.data;
};

export const getStartupById = async (id: string): Promise<ApiResponse<Startup>> => {
  const res = await apiClient.get(`/startups/${id}`);
  return res.data;
};

export const updateStartup = async (
  id: string,
  payload: Partial<CreateStartupPayload>
): Promise<ApiResponse<Startup>> => {
  const res = await apiClient.patch(`/startups/${id}`, payload);
  return res.data;
};

export const duplicateStartup = async (id: string): Promise<ApiResponse<Startup>> => {
  const res = await apiClient.post(`/startups/${id}/duplicate`);
  return res.data;
};

export const deleteStartup = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/startups/${id}`);
  return res.data;
};
