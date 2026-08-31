import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import formService from '../../services/api/formService';

// Public endpoints
export const fetchPublishedForms = createAsyncThunk(
  'form/fetchPublishedForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await formService.getPublishedForms();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch published forms' });
    }
  }
);

export const fetchPublishedFormsPaginated = createAsyncThunk(
  'form/fetchPublishedFormsPaginated',
  async (params, { rejectWithValue }) => {
    try {
      const response = await formService.getPublishedFormsPaginated(params || {});
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch published forms' });
    }
  }
);

export const fetchFormForSubmission = createAsyncThunk(
  'form/fetchFormForSubmission',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await formService.getFormForSubmission(formId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch form' });
    }
  }
);

// Admin endpoints
export const fetchAllForms = createAsyncThunk(
  'form/fetchAllForms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await formService.getAllForms(params || {});
      // formService already returns response.data, so just return it directly
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch forms' });
    }
  }
);

export const fetchFormById = createAsyncThunk(
  'form/fetchFormById',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await formService.getFormById(formId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch form' });
    }
  }
);

export const createForm = createAsyncThunk(
  'form/createForm',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await formService.createForm(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create form' });
    }
  }
);

export const updateForm = createAsyncThunk(
  'form/updateForm',
  async ({ formId, updateData }, { rejectWithValue }) => {
    try {
      const response = await formService.updateForm(formId, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update form' });
    }
  }
);

export const deleteForm = createAsyncThunk(
  'form/deleteForm',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await formService.deleteForm(formId);
      return { formId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete form' });
    }
  }
);

export const publishForm = createAsyncThunk(
  'form/publishForm',
  async ({ formId, publish }, { rejectWithValue }) => {
    try {
      const response = await formService.publishForm(formId, publish);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to publish form' });
    }
  }
);

export const searchForms = createAsyncThunk(
  'form/searchForms',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await formService.searchForms(query, params || {});
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to search forms' });
    }
  }
);

export const fetchFormAnalytics = createAsyncThunk(
  'form/fetchFormAnalytics',
  async (formId, { rejectWithValue }) => {
    try {
      const response = await formService.getFormAnalytics(formId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

export const fetchTopForms = createAsyncThunk(
  'form/fetchTopForms',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await formService.getTopForms(limit || 5);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch top forms' });
    }
  }
);

export const fetchGlobalAnalytics = createAsyncThunk(
  'form/fetchGlobalAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await formService.getGlobalAnalytics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch global analytics' });
    }
  }
);

const formSlice = createSlice({
  name: 'form',
  initialState: {
    forms: [],
    publishedForms: [],
    selectedForm: null,
    analytics: null,
    globalAnalytics: null,
    topForms: [],
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
    clearSelectedForm: (state) => {
      state.selectedForm = null;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch published forms
      .addCase(fetchPublishedForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublishedForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publishedForms = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPublishedForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch published forms paginated
      .addCase(fetchPublishedFormsPaginated.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublishedFormsPaginated.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both paginated (Page object with content) and direct array responses
        if (action.payload?.content && Array.isArray(action.payload.content)) {
          state.publishedForms = action.payload.content;
        } else if (Array.isArray(action.payload)) {
          state.publishedForms = action.payload;
        } else {
          state.publishedForms = [];
        }
      })
      .addCase(fetchPublishedFormsPaginated.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch form for submission
      .addCase(fetchFormForSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormForSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedForm = action.payload?.data || action.payload;
      })
      .addCase(fetchFormForSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch all forms (admin)
      .addCase(fetchAllForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllForms.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both paginated (Page object with content) and direct array responses
        if (action.payload?.content && Array.isArray(action.payload.content)) {
          state.forms = action.payload.content;
        } else if (Array.isArray(action.payload)) {
          state.forms = action.payload;
        } else {
          state.forms = [];
        }
      })
      .addCase(fetchAllForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch form by ID
      .addCase(fetchFormById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedForm = action.payload?.data || action.payload;
      })
      .addCase(fetchFormById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create form
      .addCase(createForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const newForm = action.payload?.data || action.payload;
        state.forms = Array.isArray(state.forms)
          ? [newForm, ...state.forms]
          : [newForm];
      })
      .addCase(createForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update form
      .addCase(updateForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const updatedForm = action.payload?.data || action.payload;
        const index = state.forms.findIndex(form => form.id === updatedForm?.id);
        if (index !== -1) {
          state.forms[index] = updatedForm;
        }
        if (state.selectedForm?.id === updatedForm?.id) {
          state.selectedForm = updatedForm;
        }
      })
      .addCase(updateForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete form
      .addCase(deleteForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.forms = state.forms.filter(form => form.id !== action.payload.formId);
      })
      .addCase(deleteForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Publish form
      .addCase(publishForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publishForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const updatedForm = action.payload?.data || action.payload;
        const index = state.forms.findIndex(form => form.id === updatedForm?.id);
        if (index !== -1) {
          state.forms[index] = updatedForm;
        }
      })
      .addCase(publishForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search forms
      .addCase(searchForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forms = action.payload?.content || [];
      })
      .addCase(searchForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch form analytics
      .addCase(fetchFormAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFormAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload?.data || action.payload;
      })
      .addCase(fetchFormAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch top forms
      .addCase(fetchTopForms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topForms = action.payload?.data || action.payload || [];
      })
      .addCase(fetchTopForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch global analytics
      .addCase(fetchGlobalAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGlobalAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.globalAnalytics = action.payload?.data || action.payload;
      })
      .addCase(fetchGlobalAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedForm, clearAnalytics } = formSlice.actions;
export default formSlice.reducer;
