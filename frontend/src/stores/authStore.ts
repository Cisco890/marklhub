import { create } from 'zustand';
import type { User } from '../types/models';

const TOKEN_KEY = 'markhub_token';

interface AuthState {
  token: string | null;
  user: User | null;
  mustChangePassword: boolean;
  setSession: (token: string, user: User, mustChangePassword: boolean) => void;
  setUser: (user: User) => void;
  setMustChangePassword: (v: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  mustChangePassword: false,

  setSession: (token, user, mustChangePassword) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, mustChangePassword });
  },

  setUser: (user) => set({ user }),

  setMustChangePassword: (mustChangePassword) => set({ mustChangePassword }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, mustChangePassword: false });
  },

  hydrate: () => {
    const t = localStorage.getItem(TOKEN_KEY);
    set({ token: t });
  },
}));

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
