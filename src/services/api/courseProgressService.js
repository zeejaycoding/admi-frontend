import apiClient from '../utils/apiClient';

/**
 * Course Progress Service
 *
 * API endpoints for tracking user progress in courses
 * Backend: /api/v1/progress
 */

const PROGRESS_ENDPOINTS = {
  MY_COURSES: '/progress/my-courses',
  INCOMPLETE: '/progress/incomplete',
  COMPLETED: '/progress/completed',
  RECENT: '/progress/recent',
  COURSE_PROGRESS: '/progress/course',
  UPDATE_POSITION: '/progress/update-position',
  MARK_COMPLETE: '/progress/mark-complete',
  ANALYTICS: '/progress/analytics/course',
};

const courseProgressService = {
  /**
   * Get all courses the user is enrolled in
   * @returns {Promise} User's enrolled courses with progress
   */
  getMyCourses: async () => {
    const response = await apiClient.get(PROGRESS_ENDPOINTS.MY_COURSES);
    return response.data;
  },

  /**
   * Get incomplete courses
   * @returns {Promise} Courses the user has not completed
   */
  getIncompleteCourses: async () => {
    const response = await apiClient.get(PROGRESS_ENDPOINTS.INCOMPLETE);
    return response.data;
  },

  /**
   * Get completed courses
   * @returns {Promise} Courses the user has completed
   */
  getCompletedCourses: async () => {
    const response = await apiClient.get(PROGRESS_ENDPOINTS.COMPLETED);
    return response.data;
  },

  /**
   * Get recently accessed courses
   * @returns {Promise} Courses the user recently accessed
   */
  getRecentlyAccessedCourses: async () => {
    const response = await apiClient.get(PROGRESS_ENDPOINTS.RECENT);
    return response.data;
  },

  /**
   * Get progress for a specific course
   * @param {number} courseId - Course ID
   * @returns {Promise} Course progress details
   */
  getCourseProgress: async (courseId) => {
    const response = await apiClient.get(`${PROGRESS_ENDPOINTS.COURSE_PROGRESS}/${courseId}`);
    return response.data;
  },

  /**
   * Update playback position (auto-save)
   * @param {number} courseId - Course ID
   * @param {number} lessonId - Lesson ID
   * @param {number} positionSeconds - Current playback position in seconds
   * @returns {Promise} Updated progress
   */
  updatePlaybackPosition: async (courseId, lessonId, positionSeconds) => {
    const response = await apiClient.post(PROGRESS_ENDPOINTS.UPDATE_POSITION, null, {
      params: {
        courseId,
        lessonId,
        positionSeconds,
      },
    });
    return response.data;
  },

  /**
   * Mark a lesson as completed
   * @param {number} courseId - Course ID
   * @param {number} lessonId - Lesson ID
   * @returns {Promise} Updated progress
   */
  markLessonComplete: async (courseId, lessonId) => {
    const response = await apiClient.post(PROGRESS_ENDPOINTS.MARK_COMPLETE, null, {
      params: {
        courseId,
        lessonId,
      },
    });
    return response.data;
  },

  /**
   * Get course analytics (admin only)
   * @param {number} courseId - Course ID
   * @returns {Promise} Course progress analytics
   */
  getCourseAnalytics: async (courseId) => {
    const response = await apiClient.get(`${PROGRESS_ENDPOINTS.ANALYTICS}/${courseId}`);
    return response.data;
  },
};

export default courseProgressService;
