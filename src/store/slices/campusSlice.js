import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import campusService from '../../services/api/campusService';

// Async thunks
export const fetchAllCampuses = createAsyncThunk(
  'campus/fetchAllCampuses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await campusService.getAllCampuses(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch campuses' });
    }
  }
);

export const searchCampuses = createAsyncThunk(
  'campus/searchCampuses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await campusService.searchCampuses(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to search campuses' });
    }
  }
);

export const getCampusById = createAsyncThunk(
  'campus/getCampusById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await campusService.getCampusById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch campus' });
    }
  }
);

export const createCampus = createAsyncThunk(
  'campus/createCampus',
  async (campusData, { rejectWithValue }) => {
    try {
      const response = await campusService.createCampus(campusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create campus' });
    }
  }
);

export const updateCampus = createAsyncThunk(
  'campus/updateCampus',
  async ({ id, campusData }, { rejectWithValue }) => {
    try {
      const response = await campusService.updateCampus(id, campusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update campus' });
    }
  }
);

export const deleteCampus = createAsyncThunk(
  'campus/deleteCampus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await campusService.deleteCampus(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete campus' });
    }
  }
);

export const uploadCampusImage = createAsyncThunk(
  'campus/uploadCampusImage',
  async ({ id, imageFile }, { rejectWithValue }) => {
    try {
      const response = await campusService.uploadCampusImage(id, imageFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to upload image' });
    }
  }
);

export const getSupportedRegions = createAsyncThunk(
  'campus/getSupportedRegions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await campusService.getSupportedRegions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch regions' });
    }
  }
);

export const getSupportedCurrencies = createAsyncThunk(
  'campus/getSupportedCurrencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await campusService.getSupportedCurrencies();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch currencies' });
    }
  }
);

// Public campus methods
export const fetchPublicCampuses = createAsyncThunk(
  'campus/fetchPublicCampuses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await campusService.publicSearchCampuses(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch public campuses' });
    }
  }
);

export const getFeaturedCampuses = createAsyncThunk(
  'campus/getFeaturedCampuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await campusService.getFeaturedCampuses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch featured campuses' });
    }
  }
);

export const getCampusesByRegion = createAsyncThunk(
  'campus/getCampusesByRegion',
  async (region, { rejectWithValue }) => {
    try {
      const response = await campusService.getCampusesByRegion(region);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch campuses by region' });
    }
  }
);

export const getPublicCampusDetails = createAsyncThunk(
  'campus/getPublicCampusDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await campusService.getPublicCampusDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch campus details' });
    }
  }
);

// Campus Management Dashboard thunks
export const fetchManagementStats = createAsyncThunk(
  'campus/fetchManagementStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await campusService.getManagementStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch management stats' });
    }
  }
);

export const fetchManagementCampuses = createAsyncThunk(
  'campus/fetchManagementCampuses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await campusService.getManagementList(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch campuses' });
    }
  }
);

const initialState = {
  campuses: [],
  featuredCampuses: [],
  campusesByRegion: [],
  currentCampus: null,
  regions: [],
  currencies: [],
  isLoading: false,
  error: null,
  filters: {
    page: 0,
    size: 12, // Updated to match the new page size
    searchTerm: '',
    region: '',
    city: '',
    sortBy: 'name',
    sortDirection: 'asc',
  },
  totalPages: 0,
  totalElements: 0,
  // Campus Management Dashboard state
  managementStats: {
    total: 0,
    active: 0,
    underReview: 0,
    inactive: 0,
  },
  managementCampuses: [],
  managementTotalPages: 0,
  managementTotalElements: 0,
  isManagementLoading: false,
};

const campusSlice = createSlice({
  name: 'campus',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCampus: (state) => {
      state.currentCampus = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campuses
      .addCase(fetchAllCampuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCampuses.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle nested API response structure
        const responseData = action.payload.data || action.payload;
        state.campuses = responseData.campuses || responseData.content || responseData;
        state.totalPages = responseData.totalPages || 0;
        state.totalElements = responseData.totalElements || 0;
        state.error = null;
      })
      .addCase(fetchAllCampuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search campuses
      .addCase(searchCampuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCampuses.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle nested API response structure
        const responseData = action.payload.data || action.payload;
        state.campuses = responseData.campuses || responseData.content || responseData;
        state.totalPages = responseData.totalPages || 0;
        state.totalElements = responseData.totalElements || 0;
        state.error = null;
      })
      .addCase(searchCampuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get campus by ID
      .addCase(getCampusById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCampusById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCampus = action.payload.data || action.payload;
      })
      .addCase(getCampusById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create campus
      .addCase(createCampus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCampus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campuses.unshift(action.payload.data || action.payload);
      })
      .addCase(createCampus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update campus
      .addCase(updateCampus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCampus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCampus = action.payload.data || action.payload;
        const index = state.campuses.findIndex(campus => campus.id === updatedCampus.id);
        if (index !== -1) {
          state.campuses[index] = updatedCampus;
        }
        if (state.currentCampus?.id === updatedCampus.id) {
          state.currentCampus = updatedCampus;
        }
      })
      .addCase(updateCampus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete campus
      .addCase(deleteCampus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCampus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campuses = state.campuses.filter(campus => campus.id !== action.payload.id);
        if (state.currentCampus?.id === action.payload.id) {
          state.currentCampus = null;
        }
      })
      .addCase(deleteCampus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload campus image
      .addCase(uploadCampusImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadCampusImage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the campus with new image URL
        const updatedCampus = action.payload.data || action.payload;
        const index = state.campuses.findIndex(campus => campus.id === updatedCampus.id);
        if (index !== -1) {
          state.campuses[index] = { ...state.campuses[index], ...updatedCampus };
        }
        if (state.currentCampus?.id === updatedCampus.id) {
          state.currentCampus = { ...state.currentCampus, ...updatedCampus };
        }
      })
      .addCase(uploadCampusImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get supported regions
      .addCase(getSupportedRegions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSupportedRegions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.regions = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(getSupportedRegions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get supported currencies
      .addCase(getSupportedCurrencies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSupportedCurrencies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currencies = action.payload.data || action.payload;
      })
      .addCase(getSupportedCurrencies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Public campus methods
      .addCase(fetchPublicCampuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicCampuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campuses = action.payload.data?.campuses || action.payload.content || action.payload;
        state.totalPages = action.payload.data?.totalPages || action.payload.totalPages || 0;
        state.totalElements = action.payload.data?.totalElements || action.payload.totalElements || 0;
      })
      .addCase(fetchPublicCampuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getFeaturedCampuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeaturedCampuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredCampuses = action.payload.data || action.payload;
      })
      .addCase(getFeaturedCampuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getCampusesByRegion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCampusesByRegion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campusesByRegion = action.payload.data || action.payload;
      })
      .addCase(getCampusesByRegion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get public campus details
      .addCase(getPublicCampusDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPublicCampusDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCampus = action.payload.data || action.payload;
      })
      .addCase(getPublicCampusDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Campus Management Dashboard
      .addCase(fetchManagementStats.pending, (state) => {
        state.isManagementLoading = true;
        state.error = null;
      })
      .addCase(fetchManagementStats.fulfilled, (state, action) => {
        state.isManagementLoading = false;
        const data = action.payload.data || action.payload;
        state.managementStats = {
          total: data.total || data.totalCampuses || 0,
          active: data.active || data.activeCampuses || 0,
          underReview: data.underReview || data.underReviewCampuses || 0,
          inactive: data.inactive || data.inactiveCampuses || 0,
        };
      })
      .addCase(fetchManagementStats.rejected, (state, action) => {
        state.isManagementLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchManagementCampuses.pending, (state) => {
        state.isManagementLoading = true;
        state.error = null;
      })
      .addCase(fetchManagementCampuses.fulfilled, (state, action) => {
        state.isManagementLoading = false;
        const responseData = action.payload.data || action.payload;
        state.managementCampuses = responseData.campuses || responseData.content || responseData;
        state.managementTotalPages = responseData.totalPages || 0;
        state.managementTotalElements = responseData.totalElements || 0;
      })
      .addCase(fetchManagementCampuses.rejected, (state, action) => {
        state.isManagementLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentCampus,
  setFilters,
  resetFilters,
} = campusSlice.actions;

export default campusSlice.reducer;
