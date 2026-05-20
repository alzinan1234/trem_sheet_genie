import apiClient from '@/lib/axios';
import { ApiResponse, PaginatedResponse, Document } from '@/types';

// ─── Upload Document ──────────────────────────────────────────────────────────
export const uploadDocument = async (payload: {
  file: File;
  fundId?: string;
  companyName?: string;
  investmentRound?: string;
}): Promise<ApiResponse<Document>> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.fundId) formData.append('fundId', payload.fundId);
  if (payload.companyName) formData.append('companyName', payload.companyName);
  if (payload.investmentRound) formData.append('investmentRound', payload.investmentRound);

  const res = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ─── Get All Documents ────────────────────────────────────────────────────────
export const getDocuments = async (params?: {
  page?: number;
  limit?: number;
  fundId?: string;
}): Promise<PaginatedResponse<Document>> => {
  const res = await apiClient.get('/documents', { params });
  return res.data;
};

// ─── Delete Document ──────────────────────────────────────────────────────────
export const deleteDocument = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/documents/${id}`);
  return res.data;
};

// ─── Bulk Delete Documents ────────────────────────────────────────────────────
export const bulkDeleteDocuments = async (ids: string[]): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete('/documents/bulk-delete', { data: { ids } });
  return res.data;
};
