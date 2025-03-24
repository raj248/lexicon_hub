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

  populateProgress: (data: Record<string, ProgressData>) => void;
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

      populateProgress: (data: Record<string, ProgressData>) => {
        console.log("Before Populating Progress Store");
        console.log(get().progress);

        set((state) => ({
          progress: Object.keys(data).reduce((acc, key) => {
            const existingEntry = state.progress[key];
            const newEntry = data[key];

            // If no existing entry or the new one is more recent, overwrite
            if (!existingEntry || newEntry.lastReadAt > existingEntry.lastReadAt) {
              acc[key] = newEntry;
            } else {
              acc[key] = existingEntry; // Keep the old one
            }

            return acc;
          }, { ...state.progress }), // Keep other progress entries
        }));

        console.log("After Populating Progress Store");
        console.log(get().progress);
      }



    }),
    {
      name: "progress-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
