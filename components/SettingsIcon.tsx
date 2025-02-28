import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/cn';

export function SettingsIcon() {
  const router = useRouter();
  const { colors } = useColorScheme();

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      className="opacity-80 mx-2"
    >
      {({ pressed }) => (
        <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
          <Icon name="cog-outline" color={colors.foreground} />
        </View>
      )}
    </Pressable>
  );
}
