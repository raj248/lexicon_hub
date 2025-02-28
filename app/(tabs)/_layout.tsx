import { Tabs } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { TabBarIcon } from '../../components/TabBarIcon';
import { FloatingHeader } from '~/components/Header';

export default function TabLayout() {
  const { colors } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.foreground,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          paddingTop: 5,
          borderTopWidth: 0,
          left: 40,
          right: 40,
          height: 50,
          borderRadius: 30,
          backgroundColor: colors.background,
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 5, // Shadow for Android
          shadowColor: '#000', // Shadow for iOS
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          header: () => <FloatingHeader title="Library" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="bookshelf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: '',
          header: () => <FloatingHeader title="Discover" />,
          tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
    </Tabs>
  );
}

