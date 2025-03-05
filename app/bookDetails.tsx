import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { Text } from "~/components/nativewindui/Text";
import { ScrollView } from "react-native-gesture-handler";
import { Picker, PickerItem } from "~/components/nativewindui/Picker";
import { useColorScheme } from "~/lib/useColorScheme";
import { useBookStore } from "~/store/bookStore";
import { useProgressStore } from "~/store/progressStore";
import { useLocalSearchParams, useNavigation } from "expo-router"

export default function BookDetailsScreen() {
  const { colors } = useColorScheme();
  const navigation = useNavigation();
  const { bookId } = useLocalSearchParams();
  const { books } = useBookStore();
  const { progress } = useProgressStore();

  const book = books[bookId as string];

  useEffect(() => {
    if (book) {
      navigation.setOptions({ title: book.title });
    }
  }, [book, navigation]);
  console.log(bookId);
  if (!book) return <Text style={{ padding: 16, color: colors.destructive }}>Book not found.</Text>;

  const [readingStatus, setReadingStatus] = useState<React.SetStateAction<string>>(progress.bookId?.readingStatus || "Not Started");

  const handleSyncStatus = () => {
    console.log("Syncing book status..."); // To be integrated later
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{book.title}</Text>
        <Text style={{ marginBottom: 16 }}>{book.author}</Text>

        <Text style={{ fontWeight: "bold" }}>Reading Status</Text>
        <Picker selectedValue={readingStatus} onValueChange={(status) => setReadingStatus(status)}>
          <PickerItem
            label="Not Started"
            value="Not Started"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
          <PickerItem
            label="Reading"
            value="Reading"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
          <PickerItem
            label="Completed"
            value="Completed"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
          <PickerItem
            label="Dropped"
            value="Dropped"
            color={colors.foreground}
            style={{
              backgroundColor: colors.root,
            }}
          />
        </Picker>

        {book.description && (
          <>
            <Text style={{ fontWeight: "bold", marginTop: 16 }}>Description</Text>
            <Text>{book.description}</Text>
          </>
        )}

        {book.externalLink && (
          <>
            <Text style={{ fontWeight: "bold", marginTop: 16 }}>External Links</Text>
            <TouchableOpacity onPress={() => Linking.openURL(book.externalLink ? book.externalLink : "")}>
              <Text style={{ textDecorationLine: "underline" }}>{book.externalLink}</Text>
            </TouchableOpacity>
          </>
        )}

        {!book.category.includes("Light Novel") && (
          <TouchableOpacity style={{ backgroundColor: "blue", padding: 16, borderRadius: 8, marginTop: 16 }} onPress={handleSyncStatus}>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>Sync Status</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
