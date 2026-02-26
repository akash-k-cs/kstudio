import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@kstudio/shared';
import { authApi } from '@/services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAccessToken: (token) => set({ accessToken: token }),

      checkAuth: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'kstudio-auth',
      partialize: (state) => ({ 
        accessToken: state.accessToken,
      }),
    }
  )
);
