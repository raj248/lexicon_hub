import { useCallback, useState } from "react";
import { View, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Text } from "~/components/nativewindui/Text";
import { useBookStore, Category } from "~/stores/bookStore";
import { useWatcherStore } from "~/stores/watcherStore";
import * as Linking from "expo-linking";
import { Button } from "react-native-paper";
import { useColorScheme } from "~/lib/useColorScheme";
import Toast from "react-native-toast-message";




export default function DiscoverTab() {
  // Inject dummy data into stores
  const { books, addBook } = useBookStore();
  const { watchers } = useWatcherStore();
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useColorScheme();


  // Refresh function (Trigger web scraping)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    console.log(watchers)
    setTimeout(() => setRefreshing(false), 1500); // Simulate API call
  }, []);

  // Process books with watchers
  const watchlist = Object.values(watchers).map((watcher) => ({
    ...watcher,
    book: books[watcher.id], // Fetch book details
    latestUpdate: watcher.updates.length > 0 ? watcher.updates[0] : null, // Get latest update
  }));

  // Sort by latest update timestamp
  watchlist.sort((a, b) => (b.latestUpdate?.releaseDate || 0) - (a.latestUpdate?.releaseDate || 0));

  const handleSearch = async () => {
    Toast.show({
      type: "info",
      text1: "Method Not Implemented",
      text2: "Contact Developer for the Feature",
    })
  }
  return (
    <View className="flex-1 p-4 ">
      {watchlist.length === 0 && (
        <View className='flex-1 justify-center items-center'>
          <Button icon="magnify" mode="elevated" className="mr-4 mt-[300]" rippleColor={colors.primary} onPress={handleSearch}>
            Search
          </Button>
        </View>
      )}

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View className="p-4 mb-4 rounded-lg">
            {/* Book Info */}
            <View className="flex-row items-start gap-4">
              <Image
                source={{ uri: item.book?.coverImage || "https://placehold.co/250" }}
                style={{ height: 100, width: 100, borderRadius: 8 }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View className="flex-1">
                <Text className="font-bold">{item.book?.title || "Unknown Title"}</Text>
                <Text className="text-sm">{item.book?.author || "Unknown Author"}</Text>
              </View>
            </View>


            {/* Updates */}
            {item.latestUpdate ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.latestUpdate?.url || "")} className="mt-3 p-2 bg-blue-600 rounded-lg">
                <Text className="font-semibold">{item.latestUpdate.chapter} - Tap to Read</Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500 mt-2 text-sm">No updates yet</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
