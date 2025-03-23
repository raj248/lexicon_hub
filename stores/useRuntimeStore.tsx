import { create } from 'zustand';

type RuntimeState = {
  searchQuery: string;

  setSearchQuery: (query: string) => void;

};

export const useRuntimeStore = create<RuntimeState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
