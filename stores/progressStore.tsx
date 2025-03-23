import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProgressData = {
  id: string;
  readProgress: number;
  chapter: number;
  lastReadAt: number;
  volume?: number;
  status: "not started" | "reading" | "completed" | "dropped";
};

type ProgressStore = {
  progress: Record<string, ProgressData>; // Store progress by book ID
  setProgress: (id: string, data: Partial<ProgressData>) => void;
  getProgress: (id: string) => ProgressData | undefined;

  populateProgress: (data: ProgressData[]) => void;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      setProgress: (id, data) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [id]: { ...state.progress[id], ...data, lastReadAt: Date.now() },
          },
        })),

      getProgress: (id) => get().progress[id],
      populateProgress: (data: ProgressData[]) => {
        set((state) => ({
          progress: {
            ...state.progress, // Keep existing progress
            ...Object.fromEntries(data.map((item) => [item.id, item])), // Convert array to object
          },
        }));
      }


    }),
    {
      name: "progress-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
