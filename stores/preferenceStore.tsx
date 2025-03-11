import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 3️⃣ Preferences Store (User Settings)
type PreferencesData = {
  readingMode?: "Light" | "Dark" | "Sepia";
  fontSize?: number;
  isFavorite?: boolean;
  notes?: string;
};

type PreferencesStore = {
  preferences: Record<string, PreferencesData>;
  updatePreferences: (id: string, prefs: Partial<PreferencesData>) => void;
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: {},
      updatePreferences: (id, prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, [id]: { ...state.preferences[id], ...prefs } },
        })),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
