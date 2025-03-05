import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { FlatGrid } from 'react-native-super-grid'; // ✅ Auto Grid Layout
import { useLibraryStore } from '~/store/useLibraryStore';
import { Image } from 'expo-image';
import { useColorScheme } from '~/lib/useColorScheme';
import { useRouter } from 'expo-router';
import { Category, useBookStore } from '~/store/bookStore';
import { useWatcherStore } from '~/store/watcherStore';

// Dummy Data Injection
const dummyBooks = [
  {
    id: '1',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    category: 'Light Novel' as Category,
    addedAt: 1709745600000,
    coverImage: 'https://placehold.co/250x350'
  },
  {
    id: '2',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Comic' as Category,
    addedAt: 1709745600000,
    coverImage: 'https://placehold.co/250x350'
  },
  {
    id: '3',
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    category: 'Web Novel' as Category,
    addedAt: 1709745600000,
    coverImage: 'https://placehold.co/250x350'
  },
  {
    id: '4',
    title: 'The Witcher',
    author: 'Andrzej Sapkowski',
    category: 'Manga' as Category,
    addedAt: 1709745600000,
    coverImage: 'https://placehold.co/250x350'
  },
];


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
  const { searchQuery } = useLibraryStore();
  const { colors, isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const { books, addBook } = useBookStore();
  const { watchers, addWatcher } = useWatcherStore();

  // Populate store with dummy data (Only runs once)
  if (Object.keys(books).length === 0) {
    dummyBooks.forEach((book) => addBook(book));
  }
  if (Object.keys(watchers).length === 0) {
    Object.entries(dummyWatchers).forEach(([id, watcher]) => {
      addWatcher(id, watcher.bookUrl);
      watcher.updates.forEach((update) => useWatcherStore.getState().addUpdate(id, update)); // Add updates
    });
  }


  const filteredBookIds = useMemo(() => {
    if (!searchQuery) return Object.keys(books); // Return all book IDs if no search query
    const lowerQuery = searchQuery.toLowerCase();

    return Object.keys(books).filter((id) =>
      books[id].title.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, books]);



  return (
    <View className="flex-1 p-4">
      <FlatGrid
        data={filteredBookIds.map((id) => books[id])}
        itemDimension={120} // ✅ Dynamic column sizing
        windowSize={5} // Keeps nearby items in memory
        initialNumToRender={20} // Pre-renders 20 items
        removeClippedSubviews={true} // Unmounts off-screen items
        keyExtractor={(item: any) => item.id}
        spacing={10} // ✅ Adds spacing between grid items
        renderItem={({ item }: { item: any }) => (
          <Pressable
            className="p-2 rounded-lg"
            onPress={() => router.push(`/bookDetails?bookId=${item.id}`)}
            style={{ backgroundColor: colors.card, width: '100%', height: 200 }}
          >
            <Image
              source={{ uri: item.coverImage }}
              style={{ width: '100%', height: 160, borderRadius: 8 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={{ height: 36, justifyContent: 'center' }}>
              <Text
                className="text-center text-xs px-1"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
            </View>
          </Pressable>

        )}
      />
    </View>
  );
}


