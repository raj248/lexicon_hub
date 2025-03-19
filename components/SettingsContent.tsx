import { StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';
// import { DebugContent } from './DebugContent';

type SettingsContentProps = {
  children?: React.ReactNode;
};

export const SettingsContent = ({ children }: SettingsContentProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <View style={styles.separator} />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    marginVertical: 20,
    // justifyContent: 'center',
  },
  separator: {
    backgroundColor: '#d1d5db',
    height: 1,
    marginVertical: 30,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
