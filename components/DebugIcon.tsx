import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/cn';

export function DebugIcon() {
  const router = useRouter();
  const { colors } = useColorScheme();

  return (
    <Pressable
      onPress={() => router.push('/debug')}
      className="opacity-80 mx-2"
    >
      {({ pressed }) => (
        <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
          <Icon name="key" color={colors.foreground} />
        </View>
      )}
    </Pressable>
  );
}
