import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { SettingsContent } from '~/components/SettingsContent';

export default function Settings() {
  return (
    <>
      <SettingsContent />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
