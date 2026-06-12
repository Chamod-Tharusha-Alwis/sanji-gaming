import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('sanji-admin-token') || null,
  isAuthenticated: false,
  isLoading: true,

  login: (token) => {
    localStorage.setItem('sanji-admin-token', token);
    set({ token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('sanji-admin-token');
    set({ token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('sanji-admin-token');
    if (!token) {
      set({ token: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      await api.get('/auth/verify');
      set({ token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('sanji-admin-token');
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
