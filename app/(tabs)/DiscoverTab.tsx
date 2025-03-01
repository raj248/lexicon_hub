import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function DiscoverTab() {
  return (
    <View style={styles.container}>
      <ScreenContent path="app/(tabs)/two.tsx" title="Tab Two" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
