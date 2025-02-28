import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '~/lib/useColorScheme';
import { useLibraryStore } from '~/store/useLibraryStore';
import { SettingsIcon } from '~/components/SettingsIcon';

export function FloatingHeader({ title }: { title: string }) {
  const { colors, isDarkColorScheme } = useColorScheme();
  const { setSearchQuery } = useLibraryStore();
  const [inputValue, setInputValue] = useState(''); // Local state for debouncing

  // Debounce logic: update global state only after 300ms delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeout); // Cleanup timeout on every change
  }, [inputValue]);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
      <Pressable onPress={Keyboard.dismiss} className="px-4 py-2">
        <View className="flex-row items-center justify-between">
          <TextInput
            className={`flex-1 h-10 rounded-full px-4 text-base shadow-md ${isDarkColorScheme ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
              }`}
            placeholder={`Search ${title}...`}
            placeholderTextColor={colors.foreground + '99'} // Slight transparency
            value={inputValue}
            onChangeText={setInputValue} // Local state updates instantly
          />
          <SettingsIcon />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
