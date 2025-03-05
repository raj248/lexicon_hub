import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UpdateEntry = {
  chapter: string;  // e.g., "Chapter 120"
  url: string;      // Direct link to the chapter
  releaseDate?: number;
};

type WatcherData = {
  id: string;
  bookUrl: string;  // Scraping URL
  updates: UpdateEntry[];  // List of detected updates
};

type WatcherStore = {
  watchers: Record<string, WatcherData>;
  addWatcher: (id: string, bookUrl: string) => void;
  removeWatcher: (id: string) => void;
  addUpdate: (id: string, update: UpdateEntry) => void;
};

export const useWatcherStore = create<WatcherStore>()(
  persist(
    (set) => ({
      watchers: {},

      addWatcher: (id, bookUrl) =>
        set((state) => ({
          watchers: { ...state.watchers, [id]: { id, bookUrl, updates: [] } },
        })),

      removeWatcher: (id) =>
        set((state) => {
          const newWatchers = { ...state.watchers };
          delete newWatchers[id];
          return { watchers: newWatchers };
        }),

      addUpdate: (id, update) =>
        set((state) => {
          if (!state.watchers[id]) return state;
          return {
            watchers: {
              ...state.watchers,
              [id]: {
                ...state.watchers[id],
                updates: [...state.watchers[id].updates, update],
              },
            },
          };
        }),
    }),
    {
      name: "watcher-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
