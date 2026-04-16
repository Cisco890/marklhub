import { create } from 'zustand';

const KEY = 'markhub_active_team';

interface TeamState {
  activeTeamId: number | null;
  setActiveTeamId: (id: number | null) => void;
  hydrate: () => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  activeTeamId: null,

  setActiveTeamId: (id) => {
    if (id == null) {
      sessionStorage.removeItem(KEY);
    } else {
      sessionStorage.setItem(KEY, String(id));
    }
    set({ activeTeamId: id });
  },

  hydrate: () => {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const n = Number(raw);
      if (!Number.isNaN(n)) {
        set({ activeTeamId: n });
      }
    }
  },
}));
