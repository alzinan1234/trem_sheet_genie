import apiClient from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResponse,
  InvestmentPipeline,
  CreateInvestmentPipelinePayload,
  PaginationParams,
} from '@/types';

export const createInvestmentPipeline = async (
  payload: CreateInvestmentPipelinePayload
): Promise<ApiResponse<InvestmentPipeline>> => {
  const res = await apiClient.post('/investment-pipeline', payload);
  return res.data;
};

export const getInvestmentPipelines = async (
  params?: PaginationParams & { fundId?: string }
): Promise<PaginatedResponse<InvestmentPipeline>> => {
  const res = await apiClient.get('/investment-pipeline', { params });
  return res.data;
};

export const getInvestmentPipelineById = async (
  id: string
): Promise<ApiResponse<InvestmentPipeline>> => {
  const res = await apiClient.get(`/investment-pipeline/${id}`);
  return res.data;
};

export const updateInvestmentPipeline = async (
  id: string,
  payload: Partial<CreateInvestmentPipelinePayload>
): Promise<ApiResponse<InvestmentPipeline>> => {
  const res = await apiClient.patch(`/investment-pipeline/${id}`, payload);
  return res.data;
};

export const deleteInvestmentPipeline = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/investment-pipeline/${id}`);
  return res.data;
};
