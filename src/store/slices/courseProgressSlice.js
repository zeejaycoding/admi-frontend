import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseProgressService from '../../services/api/courseProgressService';

// Async thunks
export const getMyCourses = createAsyncThunk(
  'courseProgress/getMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.getMyCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch courses' });
    }
  }
);

export const getCourseProgress = createAsyncThunk(
  'courseProgress/getCourseProgress',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.getCourseProgress(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch progress' });
    }
  }
);

export const updatePlaybackPosition = createAsyncThunk(
  'courseProgress/updatePlaybackPosition',
  async ({ courseId, lessonId, positionSeconds }, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.updatePlaybackPosition(
        courseId,
        lessonId,
        positionSeconds
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update position' });
    }
  }
);

export const markLessonComplete = createAsyncThunk(
  'courseProgress/markLessonComplete',
  async ({ courseId, lessonId }, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.markLessonComplete(courseId, lessonId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark lesson complete' });
    }
  }
);

export const getIncompleteCourses = createAsyncThunk(
  'courseProgress/getIncompleteCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.getIncompleteCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch incomplete courses' });
    }
  }
);

export const getCompletedCourses = createAsyncThunk(
  'courseProgress/getCompletedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.getCompletedCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch completed courses' });
    }
  }
);

export const getRecentlyAccessedCourses = createAsyncThunk(
  'courseProgress/getRecentlyAccessedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseProgressService.getRecentlyAccessedCourses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch recent courses' });
    }
  }
);

const courseProgressSlice = createSlice({
  name: 'courseProgress',
  initialState: {
    myCourses: [],
    currentProgress: null,
    incompleteCourses: [],
    completedCourses: [],
    recentCourses: [],
    playbackState: {
      courseId: null,
      lessonId: null,
      position: 0,
    },
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
    setPlaybackState: (state, action) => {
      state.playbackState = action.payload;
    },
    clearPlaybackState: (state) => {
      state.playbackState = {
        courseId: null,
        lessonId: null,
        position: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get my courses
      .addCase(getMyCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myCourses = action.payload || [];
        state.error = null;
      })
      .addCase(getMyCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch courses';
      })

      // Get course progress
      .addCase(getCourseProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProgress = action.payload;
        state.error = null;
      })
      .addCase(getCourseProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch progress';
      })

      // Update playback position
      .addCase(updatePlaybackPosition.pending, () => {
        // Don't set loading state for auto-save (background operation)
      })
      .addCase(updatePlaybackPosition.fulfilled, (state, action) => {
        if (state.currentProgress && action.payload) {
          state.currentProgress = action.payload;
        }
      })
      .addCase(updatePlaybackPosition.rejected, (state, action) => {
      })

      // Mark lesson complete
      .addCase(markLessonComplete.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(markLessonComplete.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentProgress && action.payload) {
          state.currentProgress = action.payload;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(markLessonComplete.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to mark lesson complete';
        state.success = false;
      })

      // Get incomplete courses
      .addCase(getIncompleteCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIncompleteCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incompleteCourses = action.payload || [];
        state.error = null;
      })
      .addCase(getIncompleteCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch incomplete courses';
      })

      // Get completed courses
      .addCase(getCompletedCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCompletedCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.completedCourses = action.payload || [];
        state.error = null;
      })
      .addCase(getCompletedCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch completed courses';
      })

      // Get recently accessed courses
      .addCase(getRecentlyAccessedCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecentlyAccessedCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentCourses = action.payload || [];
        state.error = null;
      })
      .addCase(getRecentlyAccessedCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch recent courses';
      });
  },
});

export const { clearError, clearSuccess, setPlaybackState, clearPlaybackState } =
  courseProgressSlice.actions;
export default courseProgressSlice.reducer;
