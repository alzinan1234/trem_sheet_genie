import apiClient from '@/lib/axios';
import { ApiResponse, PaginatedResponse, Simulation, CreateSimulationPayload, PaginationParams } from '@/types';

export const createSimulation = async (
  payload: CreateSimulationPayload
): Promise<ApiResponse<Simulation>> => {
  const res = await apiClient.post('/simulations', payload);
  return res.data;
};

export const getSimulations = async (
  params?: PaginationParams & { fundId?: string }
): Promise<PaginatedResponse<Simulation>> => {
  const res = await apiClient.get('/simulations', { params });
  return res.data;
};

export const getSimulationById = async (id: string): Promise<ApiResponse<Simulation>> => {
  const res = await apiClient.get(`/simulations/${id}`);
  return res.data;
};

export const updateSimulation = async (
  id: string,
  payload: Partial<Pick<CreateSimulationPayload, 'name' | 'description'>>
): Promise<ApiResponse<Simulation>> => {
  const res = await apiClient.patch(`/simulations/${id}`, payload);
  return res.data;
};

export const deleteSimulation = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/simulations/${id}`);
  return res.data;
};
