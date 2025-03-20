import { StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';
import { usePreferencesStore } from '~/stores/preferenceStore';
import { useColorScheme } from '~/lib/useColorScheme';
import { Toggle } from './nativewindui/Toggle';
import { Appbar, RadioButton } from 'react-native-paper';
import { Slider } from './nativewindui/Slider';
import { ScrollView } from 'react-native-gesture-handler';
// import { DebugContent } from './DebugContent';

export const SettingsContent = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    margin,
    setMargin,
    lineSpacing,
    setLineSpacing,
    orientation,
    setOrientation,
  } = usePreferencesStore();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <View className='flex-1'>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }} // Ensure it takes max space
      >
        <Text className="text-xl font-bold mb-4">Settings</Text>

        {/* Theme Selection */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-lg mb-2">Theme</Text>
          <View className="flex-row justify-between items-center">
            <Text>System Default</Text>
            <Toggle value={theme === "system"} onValueChange={() => setTheme("system")} />
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text>Light</Text>
            <Toggle value={theme === "light"} onValueChange={() => setTheme("light")} />
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text>Dark</Text>
            <Toggle value={theme === "dark"} onValueChange={() => setTheme("dark")} />
          </View>
        </View>

        {/* Font Size */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-lg mb-2">Font Size</Text>
          <View className="flex-row justify-between items-center">
            <Appbar.Action icon="chevron-left" onPress={() => setFontSize(fontSize - 1)} />
            <Text className="text-lg">{fontSize}</Text>
            <Appbar.Action icon="chevron-right" onPress={() => setFontSize(fontSize + 1)} />
          </View>
          <Slider
            minimumValue={32}
            maximumValue={72}
            step={1}
            value={fontSize}
            onValueChange={setFontSize}
            className="mt-2"
          />
        </View>

        {/* Margin */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-lg mb-2">Margin</Text>
          <View className="flex-row justify-between items-center">
            <Appbar.Action icon="chevron-left" onPress={() => setMargin(margin - 1)} />
            <Text className="text-lg">{margin}</Text>
            <Appbar.Action icon="chevron-right" onPress={() => setMargin(margin + 1)} />
          </View>
          <Slider
            minimumValue={12}
            maximumValue={42}
            step={1}
            value={margin}
            onValueChange={setMargin}
            className="mt-2"
          />
        </View>

        {/* Line Spacing */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-lg mb-2">Line Spacing</Text>
          <RadioButton.Group onValueChange={(value) => setLineSpacing(value as "compact" | "normal" | "spacious")} value={lineSpacing}>
            <View className="flex-row items-center">
              <RadioButton value="compact" />
              <Text>Compact</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="normal" />
              <Text>Normal</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="spacious" />
              <Text>Spacious</Text>
            </View>
          </RadioButton.Group>
        </View>

        {/* Screen Orientation */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <Text className="text-lg mb-2">Screen Orientation</Text>
          <RadioButton.Group onValueChange={(value) => setOrientation(value as "auto" | "portrait" | "landscape")} value={orientation}>
            <View className="flex-row items-center">
              <RadioButton value="auto" />
              <Text>Auto</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="portrait" />
              <Text>Portrait</Text>
            </View>
            <View className="flex-row items-center">
              <RadioButton value="landscape" />
              <Text>Landscape</Text>
            </View>
          </RadioButton.Group>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    // width: '100%',
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
