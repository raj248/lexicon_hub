import { StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';
import Debug from './Debug';

type ScreenContentProps = {
  children?: React.ReactNode;
};

export const ScreenContent = ({ children }: ScreenContentProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      <View style={styles.separator} />
      <Debug />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
