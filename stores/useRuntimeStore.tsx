import { create } from 'zustand';

type RuntimeState = {
  isModalOpen: boolean;
  searchQuery: string;
  headerVisibility: boolean;
  setHeaderVisibility: (visible: boolean) => void;
  toggleHeader: () => void;
  setSearchQuery: (query: string) => void;
  setModalOpen: (open: boolean) => void;
};

export const useRuntimeStore = create<RuntimeState>((set) => ({
  isModalOpen: false,
  setModalOpen: (open) => set({ isModalOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  headerVisibility: true,
  setHeaderVisibility: (visible) => set({ headerVisibility: visible }),
  toggleHeader: () => set((state) => ({ headerVisibility: !state.headerVisibility })),
}));
