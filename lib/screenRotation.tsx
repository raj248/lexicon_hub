import * as ScreenOrientation from 'expo-screen-orientation';

export const setScreenOrientation = async (orientation: "auto" | "portrait" | "landscape") => {
  try {
    if (orientation === "portrait") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } else if (orientation === "landscape") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.unlockAsync(); // Allows auto rotation
    }
  } catch (error) {
    console.error("Failed to set screen orientation:", error);
  }
};
