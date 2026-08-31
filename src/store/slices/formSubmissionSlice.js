import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import formSubmissionService from '../../services/api/formSubmissionService';

// Public/User endpoints
export const submitForm = createAsyncThunk(
  'formSubmission/submitForm',
  async ({ formId, submissionData, files }, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.submitForm(formId, submissionData, files);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to submit form' });
    }
  }
);

export const fetchMySubmissions = createAsyncThunk(
  'formSubmission/fetchMySubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.getMySubmissions();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch submissions' });
    }
  }
);

export const fetchMyFormSubmissions = createAsyncThunk(
  'formSubmission/fetchMyFormSubmissions',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.getMyFormSubmissions(formId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch submissions' });
    }
  }
);

// Admin endpoints
export const fetchFormSubmissions = createAsyncThunk(
  'formSubmission/fetchFormSubmissions',
  async ({ formId, params }, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.getFormSubmissions(formId, params || {});
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch submissions' });
    }
  }
);

export const fetchAllSubmissions = createAsyncThunk(
  'formSubmission/fetchAllSubmissions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.getAllSubmissions(params || {});
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch submissions' });
    }
  }
);

export const fetchUnreviewedSubmissions = createAsyncThunk(
  'formSubmission/fetchUnreviewedSubmissions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.getUnreviewedSubmissions(params || {});
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch unreviewed submissions' });
    }
  }
);

export const fetchSubmissionById = createAsyncThunk(
  'formSubmission/fetchSubmissionById',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.getSubmissionById(submissionId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch submission' });
    }
  }
);

export const reviewSubmission = createAsyncThunk(
  'formSubmission/reviewSubmission',
  async ({ submissionId, reviewerNotes }, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.reviewSubmission(submissionId, reviewerNotes);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to review submission' });
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  'formSubmission/deleteSubmission',
  async (submissionId, { rejectWithValue }) => {
    try {
      const response = await formSubmissionService.deleteSubmission(submissionId);
      return { submissionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete submission' });
    }
  }
);

export const exportSubmissionsToCSV = createAsyncThunk(
  'formSubmission/exportSubmissionsToCSV',
  async ({ formId, filename }, { rejectWithValue }) => {
    try {
      await formSubmissionService.downloadCSV(formId, filename);
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to export submissions' });
    }
  }
);

const formSubmissionSlice = createSlice({
  name: 'formSubmission',
  initialState: {
    submissions: { content: [], totalElements: 0 },
    mySubmissions: [],
    unreviewedSubmissions: [],
    selectedSubmission: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    success: false,
    submitSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearSelectedSubmission: (state) => {
      state.selectedSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit form
      .addCase(submitForm.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        // Optionally add to mySubmissions if user is authenticated
        if (Array.isArray(state.mySubmissions)) {
          state.mySubmissions = [action.payload, ...state.mySubmissions];
        }
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
        state.submitSuccess = false;
      })
      // Fetch my submissions
      .addCase(fetchMySubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmissions = action.payload || [];
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch my form submissions
      .addCase(fetchMyFormSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyFormSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmissions = action.payload || [];
      })
      .addCase(fetchMyFormSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch form submissions (admin)
      .addCase(fetchFormSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload || { content: [], totalElements: 0 };
      })
      .addCase(fetchFormSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch all submissions (admin)
      .addCase(fetchAllSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload || { content: [], totalElements: 0 };
      })
      .addCase(fetchAllSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch unreviewed submissions (admin)
      .addCase(fetchUnreviewedSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreviewedSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreviewedSubmissions = action.payload?.content || [];
      })
      .addCase(fetchUnreviewedSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch submission by ID
      .addCase(fetchSubmissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSubmission = action.payload;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Review submission
      .addCase(reviewSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(reviewSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const reviewedSubmission = action.payload;

        // Update in submissions array
        const index = state.submissions.findIndex(sub => sub.id === reviewedSubmission?.id);
        if (index !== -1) {
          state.submissions[index] = reviewedSubmission;
        }

        // Remove from unreviewed if present
        state.unreviewedSubmissions = state.unreviewedSubmissions.filter(
          sub => sub.id !== reviewedSubmission?.id
        );

        // Update selected submission
        if (state.selectedSubmission?.id === reviewedSubmission?.id) {
          state.selectedSubmission = reviewedSubmission;
        }
      })
      .addCase(reviewSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete submission
      .addCase(deleteSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const submissionId = action.payload.submissionId;
        state.submissions = state.submissions.filter(sub => sub.id !== submissionId);
        state.unreviewedSubmissions = state.unreviewedSubmissions.filter(sub => sub.id !== submissionId);
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Export to CSV
      .addCase(exportSubmissionsToCSV.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportSubmissionsToCSV.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(exportSubmissionsToCSV.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSubmitSuccess, clearSelectedSubmission } = formSubmissionSlice.actions;
export default formSubmissionSlice.reducer;
