import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 3️⃣ Preferences Store (User Settings)
export type PreferencesData = {
  readingMode?: "Light" | "Dark" | "Sepia";
  fontSize: number;
};

type PreferencesStore = {
  preferences: PreferencesData;
  setFontSize: (fontSize: number) => void;
  updatePreferences: (prefs: Partial<PreferencesData>) => void;
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: {
        readingMode: "Light",
        fontSize: 24,
      },

      // Update preferences
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // Set Font Size
      setFontSize: (fontSize) =>
        set((state) => ({
          preferences: { ...state.preferences, fontSize },
        })),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
