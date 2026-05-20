import apiClient from '@/lib/axios';
import { ApiResponse, NotificationSettings } from '@/types';

export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettings>> => {
  const res = await apiClient.get('/notification-settings');
  return res.data;
};

export const updateNotificationSettings = async (
  payload: Partial<Pick<NotificationSettings, 'fundActivity' | 'capitalCall' | 'distribution' | 'securityAlert'>>
): Promise<ApiResponse<NotificationSettings>> => {
  const res = await apiClient.patch('/notification-settings', payload);
  return res.data;
};
