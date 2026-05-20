import apiClient from '@/lib/axios';
import { ApiResponse, TempMedia } from '@/types';

export const uploadTempMedia = async (
  file: File,
  context: string = 'avatar'
): Promise<ApiResponse<TempMedia>> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', context);
  const res = await apiClient.post('/temp-media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
