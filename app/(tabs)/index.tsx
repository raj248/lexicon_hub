import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { FlatGrid } from 'react-native-super-grid'; // ✅ Auto Grid Layout
import { useLibraryStore } from '~/store/useLibraryStore';
import { Image } from 'expo-image';

const books = [
  { id: '1', title: 'The Lord of the Rings', coverImage: 'https://via.placeholder.com/100' },
  { id: '2', title: 'The Hobbit', coverImage: 'https://via.placeholder.com/100' },
  { id: '3', title: 'Harry Potter', coverImage: 'https://via.placeholder.com/100' },
  { id: '4', title: 'The Witcher', coverImage: 'https://via.placeholder.com/100' },
];

export default function LibraryTab() {
  const { searchQuery } = useLibraryStore();

  // 🔥 Optimize filtering using useMemo
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    return books.filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <View className="flex-1 p-4 bg-white dark:bg-black">
      <FlatGrid
        data={filteredBooks}
        itemDimension={120} // ✅ Dynamic column sizing
        windowSize={5} // Keeps nearby items in memory
        initialNumToRender={20} // Pre-renders 20 items
        removeClippedSubviews={true} // Unmounts off-screen items
        keyExtractor={(item: any) => item.id}
        spacing={10} // ✅ Adds spacing between grid items
        renderItem={({ item }: { item: any }) => (
          <Pressable className="p-2" onPress={() => console.log('Open', item.title)}>
            {/* ✅ Cached Image with FastImage */}
            <Image
              source={{ uri: item.coverImage }}
              className="w-full h-40 rounded-lg"
              contentFit="cover" // Like resizeMode in FastImage
              cachePolicy="memory-disk" // Caches images
            />
            <Text className="text-center text-xs mt-1 text-black dark:text-white">
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
