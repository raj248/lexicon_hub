import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Keyboard, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '~/lib/useColorScheme';
import { useRuntimeStore } from '~/stores/useRuntimeStore';
import { SettingsIcon } from '~/components/SettingsIcon';
import { DebugIcon } from './DebugIcon';
import Animated, { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from '@roninoss/icons';
import { Searchbar } from 'react-native-paper';

interface FloatingHeaderProps {
  title: string;
  showSearchBar?: boolean;
  showSettingsIcon?: boolean;
}

export function FloatingHeader({ title, showSearchBar = true, showSettingsIcon = true }: FloatingHeaderProps) {
  const { colors, isDarkColorScheme } = useColorScheme();
  const { setSearchQuery } = useRuntimeStore();
  const [inputValue, setInputValue] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const expandedWidth = screenWidth * 0.8;
  const collapsedWidth = 40;

  const searchWidth = useSharedValue(collapsedWidth);
  const searchOpacity = useSharedValue(1); // New shared value for opacity

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  const toggleSearch = () => {
    searchOpacity.value = withTiming(1, { duration: 200 }); // Fade out first
    setSearchVisible(true);
    searchWidth.value = withTiming(expandedWidth, { duration: 200 });
  };

  const closeSearch = () => {
    searchOpacity.value = withTiming(0, { duration: 200 }); // Fade out first
    searchWidth.value = withTiming(collapsedWidth, { duration: 200 }, () => {
      runOnJS(setSearchVisible)(false);
    });
    setInputValue('');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
      <Pressable onPress={Keyboard.dismiss} className="px-4 py-2">
        <View className="flex-row items-center justify-between rounded-full">
          {/* Animated Search Bar */}
          <Animated.View style={{ width: searchWidth, opacity: searchOpacity }}>
            {searchVisible ? (
              <TextInput
                className={`h-10 rounded-full px-4 text-base shadow-md ${isDarkColorScheme ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
                  }`}
                placeholder={`Search ${title}...`}
                placeholderTextColor={colors.foreground}
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus={searchVisible}
                onBlur={closeSearch}
              />
            ) : null}
          </Animated.View>

          {/* Icons on the Right */}
          <View className="flex-row items-center space-x-4 ml-auto">
            {showSearchBar && !searchVisible && (
              <Pressable onPress={toggleSearch}>
                <Icon name="magnify" color={colors.foreground} />
              </Pressable>
            )}
            {showSettingsIcon && <SettingsIcon />}

            <DebugIcon />
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
