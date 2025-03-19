import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// 3️⃣ Preferences Store (User Settings)
export type PreferencesData = {
  readingMode: "light" | "dark" | "sepia";
  fontSize: number;
};

type PreferencesStore = {
  preferences: PreferencesData;
  setFontSize: (fontSize: number) => void;
  getReadingMode: () => "light" | "dark" | "sepia";
  updatePreferences: (prefs: Partial<PreferencesData>) => void;
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: {
        readingMode: "dark",
        fontSize: 24,
      },

      getReadingMode: () => {
        return get().preferences.readingMode;
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
