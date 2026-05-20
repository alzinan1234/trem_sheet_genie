import apiClient from '@/lib/axios';
import { ApiResponse, Organization } from '@/types';

// ─── Create Organization ──────────────────────────────────────────────────────
export const createOrganization = async (payload: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  companyName: string;
  size: string;
  typeOfCompany: string;
  entityType: string;
}): Promise<ApiResponse<{ message: string; organization: Organization; nextStep: string | null }>> => {
  const res = await apiClient.post('/onboarding/organization', payload);
  return res.data;
};

// ─── Update Term Sheet Genie ──────────────────────────────────────────────────
export const updateTermSheetGenie = async (payload: {
  termSheetGenie: 'AS_AN_INVESTOR' | 'AS_AN_ENTREPRENEUR' | 'AS_A_STUDENT';
}): Promise<ApiResponse<{ message: string; nextStep: string }>> => {
  const res = await apiClient.patch('/onboarding/term-sheet-genie', payload);
  return res.data;
};
