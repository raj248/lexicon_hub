import { Tabs } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { TabBarIcon } from '../../components/TabBarIcon';
import { FloatingHeader } from '~/components/Header';
import { scanEpubFiles } from '~/lib/scanEpubFiles';
import { useEffect } from 'react';


export default function TabLayout() {
  useEffect(() => {
    scanEpubFiles();
  }, []);
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
          tabBarIcon: ({ color }: { color: any }) => <TabBarIcon name="bookshelf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="DiscoverTab"
        options={{
          title: '',
          header: () => <FloatingHeader title="Discover" />,
          tabBarIcon: ({ color }: { color: any }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="BackupTab"
        options={{
          title: '',
          header: () => <FloatingHeader title="Backup & Sync" showSearchBar={false} />,
          tabBarIcon: ({ color }: { color: any }) => <TabBarIcon name="cloud" color={color} />,
        }}
      />
    </Tabs>
  );
}

