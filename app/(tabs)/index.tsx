import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, InteractionManager } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { FlatGrid } from 'react-native-super-grid';
import { useRuntimeStore } from '~/stores/useRuntimeStore';
import { Image } from 'expo-image';
import { useColorScheme } from '~/lib/useColorScheme';
import { useRouter } from 'expo-router';
import Animated, { BounceOut, Easing, FadeInUp, LinearTransition } from "react-native-reanimated";
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import scanAndAddBooks from '~/utils/scanAndAddBooks';
import { Book, useBookStore } from '~/stores/bookStore';
import { getRandomBlurhash } from '~/utils/blurhash';

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
  const { books } = useBookStore.getState();
  const { searchQuery } = useRuntimeStore((state) => ({
    searchQuery: state.searchQuery,
  }));

  const { colors } = useColorScheme();
  const router = useRouter();

  const filteredBookIds = useMemo(() => {
    console.log("search query: ", searchQuery)
    if (!searchQuery) return Object.keys(books);
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

  useEffect(() => {
    onRefresh();
  }, []);

  const CoverImage = ({ uri }: { uri?: string }) => {
    const randomBlurhash = (uri) ? null : useMemo(getRandomBlurhash, []); // Ensure a consistent blurhash for each render
    return (
      <Image
        source={{ uri: uri ? uri : null }}
        style={{ width: "100%", height: 220, borderRadius: 8 }}
        contentFit="cover"
        cachePolicy="memory-disk"
        placeholder={{ blurhash: randomBlurhash }}
      />
    );
  };
  return (
    <ScrollView
      className="flex-1 mb-9"
      style={{ backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4 mb-4">

        {filteredBookIds.length > 0 ? (<FlatGrid
          scrollEnabled={false}
          data={filteredBookIds.map(id => books[id])}
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
            >
              <Pressable
                className="p-2 rounded-lg"
                onPress={() => InteractionManager.runAfterInteractions(() => router.push(`/bookDetails?bookId=${item.id}`))} style={{ backgroundColor: colors.card, width: "100%", height: 270 }}
              >
                <CoverImage uri={item.coverImage} />
                <View style={{ height: 36, justifyContent: "center" }}>
                  <Text className="text-center text-xs px-1" numberOfLines={2} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          )}
        />) : (
          <View className="flex-1 justify-center items-center">
            <Text>No books found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


