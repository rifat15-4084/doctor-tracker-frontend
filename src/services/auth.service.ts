import { api, unwrapData } from './api';
import type { LoginPayload, User } from '@/types';

export const authService = {
  /** Signs the user in. The API answers with an httpOnly session cookie. */
  async login(payload: LoginPayload): Promise<User> {
    const body = await api.post('/auth/login', payload).then((res) => res.data);
    const data = unwrapData<any>(body);
    if (data && typeof data === 'object' && 'user' in data) {
      return data.user as User;
    }
    return data as User;
  },

  /** Returns the currently authenticated user (used to hydrate the session). */
  async me(): Promise<User> {
    const body = await api.get('/auth/me').then((res) => res.data);
    return unwrapData<User>(body);
  },

  /** Clears the session cookie on the server. */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
