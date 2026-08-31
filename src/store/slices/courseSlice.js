import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../../services/api/courseService';

// Async thunks
export const fetchAllCourses = createAsyncThunk(
  'course/fetchAllCourses',
  async (params, { rejectWithValue }) => {
    try {
      const { searchTerm, page = 0, size = 12, ...rest } = params || {};
      let response;
      if (searchTerm) {
        response = await courseService.searchCourses(searchTerm, null, page, size);
      } else {
        response = await courseService.getAllCourses({ page, size, ...rest });
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch courses' });
    }
  }
);

export const getCourseById = createAsyncThunk(
  'course/getCourseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch course' });
    }
  }
);

export const getFeaturedCourses = createAsyncThunk(
  'course/getFeaturedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getFeaturedCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch featured courses' });
    }
  }
);

export const getCoursesByCategory = createAsyncThunk(
  'course/getCoursesByCategory',
  async ({ category, page, size }, { rejectWithValue }) => {
    try {
      const response = await courseService.getCoursesByCategory(category, page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch courses by category' });
    }
  }
);

export const createCourse = createAsyncThunk(
  'course/createCourse',
  async ({ courseData, thumbnailFile }, { rejectWithValue }) => {
    try {
      const response = await courseService.createCourse(courseData, thumbnailFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create course' });
    }
  }
);

export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ id, updateData, thumbnailFile }, { rejectWithValue }) => {
    try {
      const response = await courseService.updateCourse(id, updateData, thumbnailFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update course' });
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await courseService.deleteCourse(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete course' });
    }
  }
);

export const getCourseAnalytics = createAsyncThunk(
  'course/getCourseAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

export const addLesson = createAsyncThunk(
  'course/addLesson',
  async ({ courseId, lessonData, audioFile }, { rejectWithValue }) => {
    try {
      const response = await courseService.addLesson(courseId, lessonData, audioFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add lesson' });
    }
  }
);

export const updateLesson = createAsyncThunk(
  'course/updateLesson',
  async ({ lessonId, lessonData, audioFile }, { rejectWithValue }) => {
    try {
      const response = await courseService.updateLesson(lessonId, lessonData, audioFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update lesson' });
    }
  }
);

export const deleteLesson = createAsyncThunk(
  'course/deleteLesson',
  async (lessonId, { rejectWithValue }) => {
    try {
      const response = await courseService.deleteLesson(lessonId);
      return { lessonId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete lesson' });
    }
  }
);

export const reorderLessons = createAsyncThunk(
  'course/reorderLessons',
  async ({ courseId, lessonIds }, { rejectWithValue }) => {
    try {
      const response = await courseService.reorderLessons(courseId, lessonIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reorder lessons' });
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState: {
    courses: [],
    coursePagination: { totalPages: 1, totalElements: 0, currentPage: 0, pageSize: 12 },
    selectedCourse: null,
    featuredCourses: [],
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
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload?.content || action.payload || [];
        state.coursePagination = {
          totalPages: action.payload?.totalPages ?? 1,
          totalElements: action.payload?.totalElements ?? (Array.isArray(action.payload) ? action.payload.length : 0),
          currentPage: action.payload?.number ?? 0,
          pageSize: action.payload?.size ?? 12,
        };
        state.error = null;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch courses';
      })

      // Get course by ID
      .addCase(getCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCourse = action.payload;
        state.error = null;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch course';
      })

      // Get featured courses
      .addCase(getFeaturedCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeaturedCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredCourses = action.payload || [];
        state.error = null;
      })
      .addCase(getFeaturedCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch featured courses';
      })

      // Create course
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create course';
        state.success = false;
      })

      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.courses.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.selectedCourse?.id === action.payload.id) {
          state.selectedCourse = action.payload;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update course';
        state.success = false;
      })

      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter((c) => c.id !== action.payload.id);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete course';
      })

      // Get analytics
      .addCase(getCourseAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(getCourseAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics';
      })

      // Add lesson
      .addCase(addLesson.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedCourse) {
          state.selectedCourse.lessons = state.selectedCourse.lessons || [];
          state.selectedCourse.lessons.push(action.payload);
          state.selectedCourse.lessonCount = state.selectedCourse.lessons.length;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(addLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to add lesson';
        state.success = false;
      })

      // Update lesson
      .addCase(updateLesson.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedCourse?.lessons) {
          const index = state.selectedCourse.lessons.findIndex((l) => l.id === action.payload.id);
          if (index !== -1) {
            state.selectedCourse.lessons[index] = action.payload;
          }
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update lesson';
        state.success = false;
      })

      // Delete lesson
      .addCase(deleteLesson.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedCourse?.lessons) {
          state.selectedCourse.lessons = state.selectedCourse.lessons.filter(
            (l) => l.id !== action.payload.lessonId
          );
          state.selectedCourse.lessonCount = state.selectedCourse.lessons.length;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete lesson';
      });
  },
});

export const { clearError, clearSuccess, clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;
