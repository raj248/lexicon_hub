import { create } from 'zustand';
import { Chapter } from './bookStore';

type RuntimeState = {
  searchQuery: string;
  currentBookId: string;
  currentChapters: Chapter[];
  headerVisibility: boolean;
  chapterListVisibility: boolean;

  setSearchQuery: (query: string) => void;
  setHeaderVisibility: (visible: boolean) => void;
  setCurrentBookId: (id: string) => void;
  setCurrentChapters: (chapters: Chapter[]) => void;
  setChapterListVisibility: (open: boolean) => void;

  toggleHeader: () => void;
  toggleChapterList: () => void;
};

export const useRuntimeStore = create<RuntimeState>((set) => ({
  searchQuery: '',
  currentBookId: '',
  currentChapters: [],
  headerVisibility: true,
  chapterListVisibility: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurrentBookId: (id) => set({ currentBookId: id }),
  setCurrentChapters: (chapters) => set({ currentChapters: chapters }),
  setHeaderVisibility: (visible) => set({ headerVisibility: visible }),
  setChapterListVisibility: (open) => set({ chapterListVisibility: open }),

  toggleChapterList: () => set((state) => ({ chapterListVisibility: !state.chapterListVisibility, headerVisibility: !state.headerVisibility })),
  toggleHeader: () => set((state) => ({ headerVisibility: !state.headerVisibility })),
}));
