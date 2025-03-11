import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProgressData = {
  id: string;
  readProgress: number; // Percentage or exact page
  lastReadAt: number;
  chapter?: number;   // For non-Light Novels
  volume?: number;    // For Light Novels
  readingStatus?: "not started" | "reading" | "completed" | "dropped" | string;
};

type ProgressStore = {
  progress: Record<string, ProgressData>;
  addProgress: (id: string, initialData?: Partial<ProgressData>) => void;
  updateProgress: (id: string, data: Partial<ProgressData>) => void;
  setReadingStatus: (id: string, status: ProgressData["readingStatus"]) => void;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      progress: {},

      addProgress: (id, initialData = {}) =>
        set((state) => {
          if (state.progress[id]) return state;

          return {
            progress: {
              ...state.progress,
              [id]: {
                id,
                readProgress: 0,
                lastReadAt: Date.now(),
                readingStatus: "not started",
                ...initialData,
              },
            },
          };
        }),

      updateProgress: (id, data) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [id]: { ...state.progress[id], ...data },
          },
        })),

      setReadingStatus: (id, status) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [id]: { ...state.progress[id], readingStatus: status, lastReadAt: Date.now() },
          },
        })),
    }),
    {
      name: "progress-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
