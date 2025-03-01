import { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useLibraryStore } from '~/store/useLibraryStore';

const books = [
  { id: '1', title: 'The Lord of the Rings' },
  { id: '2', title: 'The Hobbit' },
  { id: '3', title: 'Harry Potter' },
  { id: '4', title: 'The Witcher' },
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
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text className="text-lg p-2 border-b border-gray-300 dark:border-gray-700 text-black dark:text-white">
            {item.title}
          </Text>
        )}
      />
    </View>
  );
}
