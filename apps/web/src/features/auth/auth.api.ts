import { getJson, postJson } from '@/services/http-client';
export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  username: string | null;
  preferredLanguage: string;
  theme: string;
};
export const getCurrentUser = async () => (await getJson<{ user: CurrentUser }>('/users/me')).user;
export const register = (input: {
  email: string;
  password: string;
  displayName: string;
  username: string;
}) => postJson<{ message: string }>('/auth/register', input);
export const login = async (input: { email: string; password: string }) =>
  (await postJson<{ user: CurrentUser }>('/auth/login', input)).user;
export const verifyEmail = (token: string) => postJson<void>('/auth/verify-email', { token });
export const forgotPassword = (email: string) =>
  postJson<{ message: string }>('/auth/forgot-password', { email });
export const resetPassword = (token: string, password: string) =>
  postJson<void>('/auth/reset-password', { token, password });
export const logout = () => postJson<void>('/auth/logout');
