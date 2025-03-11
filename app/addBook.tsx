import { useState } from "react";
import { View, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "~/components/nativewindui/Text";
import { Picker, PickerItem } from "~/components/nativewindui/Picker";
import { Book, useBookStore, Category } from "~/stores/bookStore";
import { useProgressStore } from "~/stores/progressStore";

export default function AddBookScreen() {
  const { addBook } = useBookStore();
  const { updateProgress } = useProgressStore();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<string[]>(["Book"]);
  const [coverImage, setCoverImage] = useState("");
  const [path, setPath] = useState(""); // For EPUB/PDF
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("https://placehold.co/250x350");
  const [readingStatus, setReadingStatus] = useState("Not Started");

  const handleAddBook = () => {
    if (!title.trim()) return;

    const bookData: Book = {
      id: Date.now().toString(), // Simple unique ID
      title,
      author,
      category,
      coverImage,
      language: 'en',
      path: path.trim() || undefined,
      externalLink: externalLinks.length ? externalLinks.join(", ") : undefined,
      addedAt: Date.now(),
    };
    addBook(bookData);

    updateProgress(bookData.id, { id: bookData.id, readProgress: 0, lastReadAt: Date.now() });
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setExternalLinks([...externalLinks, newLink]);
      setNewLink("");
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Title Input */}
        <Text className="font-semibold">Book Title</Text>
        <TextInput
          className="border p-2 rounded-lg mb-4"
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Author Input */}
        <Text className="font-semibold">Author</Text>
        <TextInput
          className="border p-2 rounded-lg mb-4"
          placeholder="Enter author"
          value={author}
          onChangeText={setAuthor}
        />

        {/* Category Picker */}
        <Text className="font-semibold">Category</Text>
        <Picker selectedValue={category} onValueChange={(value) => setCategory(value)} className="mb-4">
          <PickerItem value="Light Novel" label="Light Novel" />
          <PickerItem value="Web Novel" label="Web Novel" />
          <PickerItem value="Manga" label="Manga" />
          <PickerItem value="Comic" label="Comic" />
          <PickerItem value="Book" label="Book" />
        </Picker>

        {/* Location Input (For EPUB/PDF) */}
        <Text className="font-semibold">File Location (Optional)</Text>
        <TextInput
          className="border p-2 rounded-lg mb-4"
          placeholder="Enter file path"
          value={path}
          onChangeText={setPath}
        />

        {/* External Links */}
        <Text className="font-semibold">External Links</Text>
        <View className="flex-row mb-2">
          <TextInput
            className="border flex-1 p-2 rounded-lg"
            placeholder="Add a link"
            value={newLink}
            onChangeText={setNewLink}
          />
          <TouchableOpacity
            className="bg-blue-600 p-2 rounded-lg ml-2"
            onPress={handleAddLink}
          >
            <Text className="text-white">Add</Text>
          </TouchableOpacity>
        </View>
        {externalLinks.map((link, index) => (
          <Text key={index} className="text-blue-500">{link}</Text>
        ))}

        {/* Reading Status Picker */}
        <Text className="font-semibold">Reading Status</Text>
        <Picker selectedValue={readingStatus} onValueChange={setReadingStatus} className="mb-4">
          <PickerItem value="Not Started" label="Not Started" />
          <PickerItem value="Reading" label="Reading" />
          <PickerItem value="Completed" label="Completed" />
          <PickerItem value="Dropped" label="Dropped" />
        </Picker>

        {/* Save Button */}
        <TouchableOpacity className="bg-green-600 p-4 rounded-lg items-center" onPress={handleAddBook}>
          <Text className="text-white font-semibold">Save Book</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
