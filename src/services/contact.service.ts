import apiClient from '@/lib/axios';
import { ApiResponse, Contact, CreateContactPayload } from '@/types';

export const createContact = async (payload: CreateContactPayload): Promise<ApiResponse<Contact>> => {
  const res = await apiClient.post('/contacts', payload);
  return res.data;
};

export const getContacts = async (params?: { limitedPartnerId?: string }): Promise<ApiResponse<Contact[]>> => {
  const res = await apiClient.get('/contacts', { params });
  return res.data;
};

export const getContactById = async (id: string): Promise<ApiResponse<Contact>> => {
  const res = await apiClient.get(`/contacts/${id}`);
  return res.data;
};

export const updateContact = async (
  id: string,
  payload: Partial<CreateContactPayload>
): Promise<ApiResponse<Contact>> => {
  const res = await apiClient.patch(`/contacts/${id}`, payload);
  return res.data;
};

export const deleteContact = async (id: string): Promise<ApiResponse<null>> => {
  const res = await apiClient.delete(`/contacts/${id}`);
  return res.data;
};
