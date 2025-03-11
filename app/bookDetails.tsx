import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Text } from "~/components/nativewindui/Text";
import { ScrollView } from "react-native-gesture-handler";
import { Picker, PickerItem } from "~/components/nativewindui/Picker";
import { useColorScheme } from "~/lib/useColorScheme";
import { useBookStore } from "~/stores/bookStore";
import { useProgressStore } from "~/stores/progressStore";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Button } from "~/components/Button";
import { Image } from "expo-image";

export default function BookDetailsScreen() {
  const { colors } = useColorScheme();
  const navigation = useNavigation();
  const { bookId } = useLocalSearchParams();
  const { books } = useBookStore();
  const { progress } = useProgressStore();
  const [readingStatus, setReadingStatus] = useState<React.SetStateAction<string>>(progress.bookId?.readingStatus || "Not Started");

  const book = books[bookId as string];
  if (!book) return <Text style={{ padding: 16, color: colors.destructive }}>Book not found.</Text>;
  console.log(bookId);

  useEffect(() => {
    if (book) navigation.setOptions({ title: book.title });
  }, [book, navigation]);

  const handleSyncStatus = () => {
    console.log("Syncing book status..."); // To be integrated later
  };
  console.log(book.author)

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image with Tint */}
      <Image
        source={{ uri: book.coverImage }}
        style={styles.backgroundImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.tintOverlay} />

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* Foreground Image */}


        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        {Array.isArray(book.category) && book.category.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 mt-2">
            {book.category.map((cat, index) => (
              <View
                key={index}
                className="px-5 py-2 rounded-full"
                style={{ backgroundColor: colors.primary, opacity: 0.7 }}
              >
                <Text className="text-lg text-white" style={{ fontWeight: "bold" }}>#{cat}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.foreground }}>No categories available</Text>
        )}

        <View className="flex-row justify-between mt-4 mb-4">
          {!book.category?.includes("Light Novel") && <Button title="Update" />}
          <Button title="Edit" />
          <Button title="Read" />
        </View>

        <View className="flex-row items-center gap-3">
          <Text className="text-base font-semibold text-white">Reading Status</Text>
          <View className="flex-1">
            <Picker
              style={{ width: "100%", minHeight: 40 }} // Ensure it has a height
              className="rounded-full"
              selectedValue={readingStatus}
              onValueChange={(status) => setReadingStatus(status)}
            >
              <PickerItem style={{ fontSize: 15 }} label="Not Started" value="Not Started" color={colors.foreground} />
              <PickerItem style={{ fontSize: 15 }} label="Reading" value="Reading" color={colors.foreground} />
              <PickerItem style={{ fontSize: 15 }} label="Completed" value="Completed" color={colors.foreground} />
              <PickerItem style={{ fontSize: 15 }} label="Dropped" value="Dropped" color={colors.foreground} />
            </Picker>
          </View>
        </View>




        {book.description ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </>
        ) : (
          <Text style={styles.sectionTitle}>No Description</Text>
        )}

        {book.externalLink && (
          <>
            <Text style={styles.sectionTitle}>External Links</Text>
            <TouchableOpacity onPress={() => Linking.openURL(book.externalLink || "")}>
              <Text style={styles.link}>{book.externalLink || ""}</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    position: "absolute",
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // Dark semi-transparent overlay
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white", // Ensure readability on tinted background
  },
  author: {
    marginBottom: 16,
    color: "white",
  },
  sectionTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    color: "white",
  },
  description: {
    color: "white",
  },
  pickerItem: {
    backgroundColor: "rgba(255,255,255,0.2)", // Slight transparency
  },
  link: {
    textDecorationLine: "underline",
    color: "#87CEEB", // Light blue link color
  },
});

