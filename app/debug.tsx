import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { DebugContent } from '~/components/DebugContent';

export default function Settings() {
  return (
    <>
      <DebugContent />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
