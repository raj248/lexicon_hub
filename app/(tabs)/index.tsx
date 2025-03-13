import { useEffect, useMemo, useState } from 'react';
import { View, Pressable, InteractionManager } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { FlatGrid } from 'react-native-super-grid'; // ✅ Auto Grid Layout
import { useRuntimeStore } from '~/stores/useRuntimeStore';
import { Image } from 'expo-image';
import { useColorScheme } from '~/lib/useColorScheme';
import { useRouter } from 'expo-router';
import Animated, { BounceIn, BounceInUp, BounceOut, Easing, FadeInUp, LinearTransition, SlideInRight } from "react-native-reanimated";
import { Button } from '~/components/Button';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import scanAndAddBooks from '~/utils/scanAndAddBooks';
import { useBookStore } from '~/stores/bookStore';


const dummyWatchers = {
  "1": {
    id: "1",
    bookUrl: "https://example.com/lotr",
    updates: [
      { chapter: "Chapter 10", url: "https://example.com/lotr/ch10", releaseDate: 1709856000000 },
      { chapter: "Chapter 9", url: "https://example.com/lotr/ch9", releaseDate: 1709779600000 },
    ],
  },
  "2": {
    id: "2",
    bookUrl: "https://example.com/hobbit",
    updates: [
      { chapter: "Chapter 5", url: "https://example.com/hobbit/ch5", releaseDate: 1709745600000 },
    ],
  },
  "3": {
    id: "3",
    bookUrl: "https://example.com/hp",
    updates: [],
  },
  "4": {
    id: "4",
    bookUrl: "https://example.com/witcher",
    updates: [
      { chapter: "Chapter 20", url: "https://example.com/witcher/ch20", releaseDate: 1709802000000 },
    ],
  },
};


export default function LibraryTab() {

  const { books, debugClear } = useBookStore();
  const { searchQuery } = useRuntimeStore();
  const { colors } = useColorScheme();
  const router = useRouter();

  const clear = () => {
    console.log("clearing")
    InteractionManager.runAfterInteractions(() => {
      // Object.keys(books).map((id) => useBookStore.getState().removeBook(id))
      // Object.keys(watchers).map((id) => useWatcherStore.getState().removeWatcher(id))
      debugClear();
      console.log("cleared")
    });
  }


  const filteredBookIds = useMemo(() => {
    if (!searchQuery) return Object.keys(books); // Return all book IDs if no search query
    const lowerQuery = searchQuery.toLowerCase();

    return Object.keys(books).filter((id) =>
      books[id].title.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, books]);


  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    InteractionManager.runAfterInteractions(() => {
      scanAndAddBooks().then(() => {
        setRefreshing(false);
      });
    });
  };

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4 mb-4">
        <Button title="ClearDebug" onPress={clear} />
        <FlatGrid
          scrollEnabled={false}
          data={filteredBookIds.map((id) => books[id])}
          itemDimension={120}
          windowSize={11}
          maxToRenderPerBatch={15} // Reduce number of items rendered at once
          initialNumToRender={10}
          removeClippedSubviews={true}
          keyExtractor={(item: any) => item.id}
          spacing={10}
          renderItem={({ item }: { item: any }) => (
            <Animated.View layout={LinearTransition.springify()}
              entering={FadeInUp
                .delay(500)
                .duration(500)
                .easing(Easing.sin)}
              exiting={BounceOut
                .delay(200)
                .duration(300)
                .easing(Easing.inOut(Easing.elastic(2)))}
            >
              <Pressable
                className="p-2 rounded-lg"
                onPress={() => InteractionManager.runAfterInteractions(() => router.push(`/bookDetails?bookId=${item.id}`))} style={{ backgroundColor: colors.card, width: "100%", height: 270 }}
              >
                <Image
                  source={{ uri: item.coverImage }}
                  style={{ width: "100%", height: 220, borderRadius: 8 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <View style={{ height: 36, justifyContent: "center" }}>
                  <Text className="text-center text-xs px-1" numberOfLines={2} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      </View>
    </ScrollView>
  );
}


