import '../global.css';
import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeToggle } from '~/components/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';

import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

import * as FileUtil from 'modules/FileUtil'
import Toast from 'react-native-toast-message';

import { usePreferencesStore } from '~/stores/preferenceStore';
import { Appearance } from "react-native";
import { setScreenOrientation } from '~/lib/screenRotation';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden'); // ✅ Hide navigation bar
    NavigationBar.setBehaviorAsync('overlay-swipe'); // ✅ Show only when swiped
    // EpubKit.requestStoragePermission()
    FileUtil.RequestStoragePermission()
  }, []);
  useInitialAndroidBarSync();

  const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();
  const theme = usePreferencesStore((state) => state.theme);
  const orientation = usePreferencesStore((state) => state.orientation);
  const systemColorScheme = Appearance.getColorScheme();
  useEffect(() => {
    const currentTheme = theme === "system" ? systemColorScheme ?? "light" : theme;
    setColorScheme(currentTheme);
  }, [theme])

  useEffect(() => {
    setScreenOrientation(orientation)
  }, [orientation])

  // Hide the navigation bar when the app starts

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack screenOptions={SCREEN_OPTIONS}>
                <Stack.Screen name="(tabs)" options={TABS_OPTIONS} />
                <Stack.Screen name="settings" options={SETTINGS_OPTIONS} />
                <Stack.Screen name="debug" options={DEBUG_OPTIONS} />
                <Stack.Screen name="bookDetails" options={DETAILS_OPTIONS} />
                <Stack.Screen name='reader' />
              </Stack>
              <Toast />
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const TABS_OPTIONS = {
  headerShown: false,
} as const;

const SETTINGS_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'Settings',
  headerRight: () => <ThemeToggle />,
} as const;

const DEBUG_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'DEBUG',
  headerRight: () => <ThemeToggle />,
} as const;

const DETAILS_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  headerRight: () => <ThemeToggle />,
} as const;
