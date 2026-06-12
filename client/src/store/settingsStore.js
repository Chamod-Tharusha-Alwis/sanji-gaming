import { create } from 'zustand';
import api from '../lib/api';

const useSettingsStore = create((set) => ({
  whatsappNumber: '94700000000', // Default fallback country-coded placeholder
  loading: true,

  fetchSettings: async () => {
    try {
      const { data } = await api.get('/settings/public');
      set({ whatsappNumber: data.whatsappNumber || '94700000000', loading: false });
    } catch (error) {
      console.error('Failed to load public settings:', error.message);
      set({ whatsappNumber: '94700000000', loading: false }); // Fallback on failure
    }
  },
}));

export default useSettingsStore;
