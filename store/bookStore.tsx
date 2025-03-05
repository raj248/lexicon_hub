import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

export type Category = "Light Novel" | "Web Novel" | "Manga" | "Comic" | "Book";

export type Book = {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  category: Category;
  description?: string;
  path?: string;  // Path for local files (if EPUB/PDF)
  volumes?: string[]; // Only for Light Novels (list of volume file paths)
  addedAt: number;
  externalLink?: string; // Store external sources for the book
};

type BookStore = {
  books: Record<string, Book>;
  addBook: (book: Book) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  removeBook: (id: string) => void;
};

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: {},

      addBook: (book) =>
        set((state) => {
          if (state.books[book.id]) return state; // Prevent duplicates
          return { books: { ...state.books, [book.id]: book } };
        }),

      updateBook: (id, data) =>
        set((state) => ({
          books: { ...state.books, [id]: { ...state.books[id], ...data } },
        })),

      removeBook: (id) =>
        set((state) => {
          const newBooks = { ...state.books };
          delete newBooks[id];
          return { books: newBooks };
        }),
    }),
    {
      name: "book-storage", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
