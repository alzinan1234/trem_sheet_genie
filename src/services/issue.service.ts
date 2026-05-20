import apiClient from '@/lib/axios';
import { ApiResponse, PaginatedResponse, Issue } from '@/types';

export const reportIssue = async (payload: {
  email: string;
  title: string;
  type: 'BUG' | 'FEATURE' | 'OTHER';
  description: string;
}): Promise<ApiResponse<Issue>> => {
  const res = await apiClient.post('/issues', payload);
  return res.data;
};

export const getIssues = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Issue>> => {
  const res = await apiClient.get('/issues', { params });
  return res.data;
};

export const getIssueById = async (id: string): Promise<ApiResponse<Issue>> => {
  const res = await apiClient.get(`/issues/${id}`);
  return res.data;
};

export const updateIssueStatus = async (
  id: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
): Promise<ApiResponse<Issue>> => {
  const res = await apiClient.patch(`/issues/${id}/status`, { status });
  return res.data;
};

export const deleteIssue = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/issues/${id}`);
  return res.data;
};
