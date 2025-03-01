import { create } from "zustand";

type TrackingData = {
  readChapters?: number;
  readVolumes?: number;
  lastReadAt?: number;
  isCompleted?: boolean;
};

type TrackingStore = {
  progress: Record<string, TrackingData>;
  updateProgress: (id: string, data: Partial<TrackingData>) => void;
};

export const useTrackingStore = create<TrackingStore>((set) => ({
  progress: {},
  updateProgress: (id, data) =>
    set((state) => ({
      progress: { ...state.progress, [id]: { ...state.progress[id], ...data } },
    })),
}));
