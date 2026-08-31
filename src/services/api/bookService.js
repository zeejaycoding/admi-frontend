import apiClient from '../utils/apiClient';

/**
 * Book Service
 *
 * API endpoints for book management
 * Backend: /api/v1/books
 */

const BOOK_ENDPOINTS = {
  GET_ALL: '/books',
  GET_BY_ID: '/books',
  CREATE: '/books',
  UPDATE: '/books',
  DELETE: '/books',
  SEARCH: '/books/search',
  FEATURED: '/books/featured',
  ANALYTICS: '/books/admin/analytics',
  // File uploads
  UPLOAD_PDF: '/files/book-pdf',
  UPLOAD_COVER: '/files/book-cover',
  UPLOAD_BACK_COVER: '/files/book-back-cover',
};

const bookService = {
  /**
   * Get all books (admin - includes inactive)
   * @param {Object} params - Query parameters (page, size, sort)
   * @returns {Promise} Response with paginated books
   */
  getAllBooks: async (params = {}) => {
    const response = await apiClient.get(BOOK_ENDPOINTS.GET_ALL, { params });
    return response.data;
  },

  /**
   * Get book by ID
   * @param {number} id - Book ID
   * @returns {Promise} Book details
   */
  getBookById: async (id) => {
    const response = await apiClient.get(`${BOOK_ENDPOINTS.GET_BY_ID}/${id}`);
    return response.data;
  },

  /**
   * Search books with filters
   * @param {Object} searchParams - Search criteria
   * @returns {Promise} Search results
   */
  searchBooks: async (searchParams) => {
    const response = await apiClient.post(BOOK_ENDPOINTS.SEARCH, searchParams);
    return response.data;
  },

  /**
   * Get featured books
   * @param {number} limit - Number of books to fetch
   * @returns {Promise} Featured books
   */
  getFeaturedBooks: async (limit = 10) => {
    const response = await apiClient.get(`${BOOK_ENDPOINTS.FEATURED}?limit=${limit}`);
    return response.data;
  },

  /**
   * Create book with file uploads (PDF + Cover images)
   * @param {Object} bookData - Book details
   * @param {File} pdfFile - PDF file (required)
   * @param {File} coverImageFile - Front cover image (optional)
   * @param {File} backCoverImageFile - Back cover image (optional)
   * @returns {Promise} Created book
   */
  createBookWithFiles: async (bookData, pdfFile, coverImageFile = null, backCoverImageFile = null) => {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Add book data fields
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== undefined) {
        // Handle arrays (tags, availableRegions)
        if (Array.isArray(bookData[key])) {
          formData.append(key, bookData[key].join(','));
        } else {
          formData.append(key, bookData[key]);
        }
      }
    });

    // Add files
    if (pdfFile) {
      formData.append('pdfFile', pdfFile);
    }
    if (coverImageFile) {
      formData.append('coverImageFile', coverImageFile);
    }
    if (backCoverImageFile) {
      formData.append('backCoverImageFile', backCoverImageFile);
    }

    const response = await apiClient.post(BOOK_ENDPOINTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update book (metadata only - no file uploads)
   * @param {number} id - Book ID
   * @param {Object} updateData - Updated book data
   * @returns {Promise} Updated book
   */
  updateBook: async (id, updateData) => {
    const response = await apiClient.put(`${BOOK_ENDPOINTS.UPDATE}/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete book (soft delete)
   * @param {number} id - Book ID
   * @returns {Promise} Success message
   */
  deleteBook: async (id) => {
    const response = await apiClient.delete(`${BOOK_ENDPOINTS.DELETE}/${id}`);
    return response.data;
  },

  /**
   * Upload book PDF (separate endpoint for updating existing book)
   * @param {number} bookId - Book ID
   * @param {File} pdfFile - PDF file
   * @returns {Promise} Upload result with URL
   */
  uploadBookPdf: async (bookId, pdfFile) => {
    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await apiClient.post(
      `${BOOK_ENDPOINTS.UPLOAD_PDF}/${bookId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload book cover image (Cloudinary - auto-optimized)
   * @param {number} bookId - Book ID
   * @param {File} imageFile - Cover image file
   * @returns {Promise} Upload result with Cloudinary URL
   */
  uploadBookCover: async (bookId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post(
      `${BOOK_ENDPOINTS.UPLOAD_COVER}/${bookId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload book back cover image (Cloudinary - auto-optimized)
   * @param {number} bookId - Book ID
   * @param {File} imageFile - Back cover image file
   * @returns {Promise} Upload result with Cloudinary URL
   */
  uploadBookBackCover: async (bookId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post(
      `${BOOK_ENDPOINTS.UPLOAD_BACK_COVER}/${bookId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get book analytics (admin only)
   * @returns {Promise} Analytics data
   */
  getBookAnalytics: async () => {
    const response = await apiClient.get(BOOK_ENDPOINTS.ANALYTICS);
    return response.data;
  },
};

export default bookService;
