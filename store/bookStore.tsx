import { create } from "zustand";

// 1️⃣ Book Store (Core Data Management)
type Book = {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  category: "Light Novel" | "Web Novel" | "Manga" | "Comic" | "Book";
  sourceUrl?: string;
  addedAt: number;
};

type BookStore = {
  books: Record<string, Book>;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
};

export const useBookStore = create<BookStore>((set) => ({
  books: {},
  addBook: (book) =>
    set((state) => ({ books: { ...state.books, [book.id]: book } })),
  removeBook: (id) =>
    set((state) => {
      const newBooks = { ...state.books };
      delete newBooks[id];
      return { books: newBooks };
    }),
}));