import apiClient from '../utils/apiClient';

/**
 * Course Service
 *
 * API endpoints for course management
 * Backend: /api/v1/courses, /api/v1/lessons
 */

const COURSE_ENDPOINTS = {
  GET_ALL: '/courses',
  GET_BY_ID: '/courses',
  CREATE: '/courses',
  UPDATE: '/courses',
  DELETE: '/courses',
  SEARCH: '/courses/search',
  FEATURED: '/courses/featured',
  RECENT: '/courses/recent',
  TOP_ENROLLED: '/courses/top-enrolled',
  BY_CATEGORY: '/courses/category',
  ANALYTICS: '/courses/analytics',
};

const LESSON_ENDPOINTS = {
  GET_BY_COURSE: '/lessons/course',
  GET_BY_ID: '/lessons',
  ADD: '/lessons/course',
  UPDATE: '/lessons',
  DELETE: '/lessons',
  REORDER: '/lessons/course',
  STREAM: '/lessons',
  PREVIEW: '/lessons/course',
};

const courseService = {
  /**
   * Get all courses
   * @param {Object} params - Query parameters (page, size, sortBy, sortDirection)
   * @returns {Promise} Response with paginated courses
   */
  getAllCourses: async (params = {}) => {
    const response = await apiClient.get(COURSE_ENDPOINTS.GET_ALL, { params });
    return response.data;
  },

  /**
   * Get course by ID (includes lessons)
   * @param {number} id - Course ID
   * @returns {Promise} Course details with lessons
   */
  getCourseById: async (id) => {
    const response = await apiClient.get(`${COURSE_ENDPOINTS.GET_BY_ID}/${id}`);
    return response.data;
  },

  /**
   * Get featured courses
   * @returns {Promise} Featured courses
   */
  getFeaturedCourses: async () => {
    const response = await apiClient.get(COURSE_ENDPOINTS.FEATURED);
    return response.data;
  },

  /**
   * Get recent courses
   * @param {number} limit - Number of courses to fetch
   * @returns {Promise} Recent courses
   */
  getRecentCourses: async (limit = 6) => {
    const response = await apiClient.get(`${COURSE_ENDPOINTS.RECENT}?limit=${limit}`);
    return response.data;
  },

  /**
   * Get top enrolled courses
   * @param {number} limit - Number of courses to fetch
   * @returns {Promise} Top enrolled courses
   */
  getTopEnrolledCourses: async (limit = 6) => {
    const response = await apiClient.get(`${COURSE_ENDPOINTS.TOP_ENROLLED}?limit=${limit}`);
    return response.data;
  },

  /**
   * Get courses by category
   * @param {string} category - Course category
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Courses in category
   */
  getCoursesByCategory: async (category, page = 0, size = 12) => {
    const response = await apiClient.get(`${COURSE_ENDPOINTS.BY_CATEGORY}/${category}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Search courses
   * @param {string} searchTerm - Search term
   * @param {string} category - Optional category filter
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Search results
   */
  searchCourses: async (searchTerm, category = null, page = 0, size = 12) => {
    const params = { searchTerm, page, size };
    if (category) {
      params.category = category;
    }
    const response = await apiClient.get(COURSE_ENDPOINTS.SEARCH, { params });
    return response.data;
  },

  /**
   * Create course with thumbnail
   * @param {Object} courseData - Course details
   * @param {File} thumbnailFile - Thumbnail image (optional)
   * @returns {Promise} Created course
   */
  createCourse: async (courseData, thumbnailFile = null) => {
    const formData = new FormData();

    // Add course data fields
    Object.keys(courseData).forEach((key) => {
      if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });

    // Add thumbnail
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await apiClient.post(COURSE_ENDPOINTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update course
   * @param {number} id - Course ID
   * @param {Object} updateData - Updated course data
   * @param {File} thumbnailFile - New thumbnail image (optional)
   * @returns {Promise} Updated course
   */
  updateCourse: async (id, updateData, thumbnailFile = null) => {
    const formData = new FormData();

    // Add update data fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== null && updateData[key] !== undefined) {
        formData.append(key, updateData[key]);
      }
    });

    // Add thumbnail if provided
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await apiClient.put(`${COURSE_ENDPOINTS.UPDATE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete course (soft delete)
   * @param {number} id - Course ID
   * @returns {Promise} Success message
   */
  deleteCourse: async (id) => {
    const response = await apiClient.delete(`${COURSE_ENDPOINTS.DELETE}/${id}`);
    return response.data;
  },

  /**
   * Get course analytics (admin only)
   * @returns {Promise} Analytics data
   */
  getCourseAnalytics: async () => {
    const response = await apiClient.get(COURSE_ENDPOINTS.ANALYTICS);
    return response.data;
  },

  /**
   * Get lessons for a course
   * @param {number} courseId - Course ID
   * @returns {Promise} List of lessons
   */
  getCourseLessons: async (courseId) => {
    const response = await apiClient.get(`${LESSON_ENDPOINTS.GET_BY_COURSE}/${courseId}`);
    return response.data;
  },

  /**
   * Get lesson by ID
   * @param {number} lessonId - Lesson ID
   * @returns {Promise} Lesson details
   */
  getLessonById: async (lessonId) => {
    const response = await apiClient.get(`${LESSON_ENDPOINTS.GET_BY_ID}/${lessonId}`);
    return response.data;
  },

  /**
   * Add lesson to course
   * @param {number} courseId - Course ID
   * @param {Object} lessonData - Lesson details (title, description, durationSeconds, isPreview)
   * @param {File} audioFile - Audio file (required)
   * @returns {Promise} Created lesson
   */
  addLesson: async (courseId, lessonData, audioFile) => {
    const formData = new FormData();

    // Add lesson data
    Object.keys(lessonData).forEach((key) => {
      if (lessonData[key] !== null && lessonData[key] !== undefined) {
        formData.append(key, lessonData[key]);
      }
    });

    // Add audio file
    if (audioFile) {
      formData.append('audioFile', audioFile);
    }

    const response = await apiClient.post(`${LESSON_ENDPOINTS.ADD}/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update lesson
   * @param {number} lessonId - Lesson ID
   * @param {Object} lessonData - Updated lesson data
   * @param {File} audioFile - New audio file (optional)
   * @returns {Promise} Updated lesson
   */
  updateLesson: async (lessonId, lessonData, audioFile = null) => {
    const formData = new FormData();

    // Add lesson data
    Object.keys(lessonData).forEach((key) => {
      if (lessonData[key] !== null && lessonData[key] !== undefined) {
        formData.append(key, lessonData[key]);
      }
    });

    // Add audio file if provided
    if (audioFile) {
      formData.append('audioFile', audioFile);
    }

    const response = await apiClient.put(`${LESSON_ENDPOINTS.UPDATE}/${lessonId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete lesson
   * @param {number} lessonId - Lesson ID
   * @returns {Promise} Success message
   */
  deleteLesson: async (lessonId) => {
    const response = await apiClient.delete(`${LESSON_ENDPOINTS.DELETE}/${lessonId}`);
    return response.data;
  },

  /**
   * Reorder lessons in a course
   * @param {number} courseId - Course ID
   * @param {Array<number>} lessonIds - Ordered array of lesson IDs
   * @returns {Promise} Success message
   */
  reorderLessons: async (courseId, lessonIds) => {
    const response = await apiClient.put(
      `${LESSON_ENDPOINTS.REORDER}/${courseId}/reorder`,
      lessonIds
    );
    return response.data;
  },

  /**
   * Get lesson stream URL (presigned URL for audio streaming)
   * @param {number} lessonId - Lesson ID
   * @returns {Promise} Stream URL with 1-hour expiry
   */
  getLessonStreamUrl: async (lessonId) => {
    const response = await apiClient.get(`${LESSON_ENDPOINTS.STREAM}/${lessonId}/stream`);
    return response.data;
  },

  /**
   * Get preview lessons for a course
   * @param {number} courseId - Course ID
   * @returns {Promise} List of preview lessons
   */
  getPreviewLessons: async (courseId) => {
    const response = await apiClient.get(`${LESSON_ENDPOINTS.PREVIEW}/${courseId}/preview`);
    return response.data;
  },
};

export default courseService;
