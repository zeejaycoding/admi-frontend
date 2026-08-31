import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookService from '../../services/api/bookService';

// Async thunks
export const fetchAllBooks = createAsyncThunk(
  'book/fetchAllBooks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookService.getAllBooks(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch books' });
    }
  }
);

export const getBookById = createAsyncThunk(
  'book/getBookById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookService.getBookById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch book' });
    }
  }
);

export const createBookWithFiles = createAsyncThunk(
  'book/createBookWithFiles',
  async ({ bookData, pdfFile, coverImageFile, backCoverImageFile }, { rejectWithValue }) => {
    try {
      const response = await bookService.createBookWithFiles(bookData, pdfFile, coverImageFile, backCoverImageFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create book' });
    }
  }
);

export const updateBook = createAsyncThunk(
  'book/updateBook',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await bookService.updateBook(id, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update book' });
    }
  }
);

export const deleteBook = createAsyncThunk(
  'book/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookService.deleteBook(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete book' });
    }
  }
);

export const getBookAnalytics = createAsyncThunk(
  'book/getBookAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookService.getBookAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

const bookSlice = createSlice({
  name: 'book',
  initialState: {
    books: [],
    bookPagination: { totalPages: 1, totalElements: 0, currentPage: 0, pageSize: 12 },
    selectedBook: null,
    analytics: null,
    isLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all books
      .addCase(fetchAllBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload?.content || [];
        state.bookPagination = {
          totalPages: action.payload?.totalPages ?? 1,
          totalElements: action.payload?.totalElements ?? 0,
          currentPage: action.payload?.number ?? 0,
          pageSize: action.payload?.size ?? 12,
        };
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get book by ID
      .addCase(getBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract data from response wrapper
        state.selectedBook = action.payload?.data || null;
      })
      .addCase(getBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create book with files
      .addCase(createBookWithFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBookWithFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Add new book to books array
        const newBook = action.payload;
        state.books = Array.isArray(state.books)
          ? [newBook, ...state.books]
          : [newBook];
      })
      .addCase(createBookWithFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update book
      .addCase(updateBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Update book in books array
        const updatedBook = action.payload;
        const index = state.books.findIndex(book => book.id === updatedBook?.id);
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete book
      .addCase(deleteBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.books = state.books.filter(book => book.id !== action.payload.id);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get analytics
      .addCase(getBookAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract data from response wrapper
        state.analytics = action.payload?.data || null;
      })
      .addCase(getBookAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
