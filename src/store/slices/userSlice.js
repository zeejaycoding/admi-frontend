import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import userService from '../../services/api/userService';

const initialState = {
  users: [],
  currentUser: null,
  userStats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    searchTerm: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  },
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to fetch users' });
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to search users' });
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

export const assignUserRole = createAsyncThunk(
  'users/assignRole',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await userService.assignRole(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to assign role' });
    }
  }
);

export const removeUserRole = createAsyncThunk(
  'users/removeRole',
  async ({ userId, roleName }, { rejectWithValue }) => {
    try {
      const response = await userService.removeRole(userId, roleName);
      return { userId, roleName, response };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to remove role' });
    }
  }
);

export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.activateUser(userId);
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to activate user' });
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.deactivateUser(userId);
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to deactivate user' });
    }
  }
);

export const fetchUserStatistics = createAsyncThunk(
  'users/fetchUserStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to fetch user statistics' });
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to create user' });
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await userService.resetUserPassword(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to reset password' });
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.pagination = initialState.pagination;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle ApiResponse<Page<UserListResponse>> structure
        const responseData = action.payload.data || action.payload;
        state.users = responseData.content || [];
        state.pagination = {
          page: responseData.pageable?.pageNumber || responseData.number || 0,
          size: responseData.pageable?.pageSize || responseData.size || 20,
          totalElements: responseData.totalElements || 0,
          totalPages: responseData.totalPages || 0,
        };
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle ApiResponse<Page<UserListResponse>> structure
        const responseData = action.payload.data || action.payload;
        state.users = responseData.content || [];
        state.pagination = {
          page: responseData.pageable?.pageNumber || responseData.number || 0,
          size: responseData.pageable?.pageSize || responseData.size || 20,
          totalElements: responseData.totalElements || 0,
          totalPages: responseData.totalPages || 0,
        };
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.data || action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Assign role
      .addCase(assignUserRole.fulfilled, (state, action) => {
        // Update the user in the list if they exist
        const userIndex = state.users.findIndex(user => user.id === action.payload.userId);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], ...action.payload.data };
        }
      })
      // Remove role
      .addCase(removeUserRole.fulfilled, (state, action) => {
        const { userId, roleName } = action.payload;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          // Remove the role from the user's roles array
          const user = state.users[userIndex];
          if (user.roles) {
            user.roles = user.roles.filter(role => {
              const roleValue = typeof role === 'string' ? role : role.name;
              return roleValue !== roleName;
            });
          }
        }
      })
      // Activate user
      .addCase(activateUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].isActive = true;
        }
      })
      // Deactivate user
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const userIndex = state.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].isActive = false;
        }
      })
      // Fetch user statistics
      .addCase(fetchUserStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle ApiResponse structure for user statistics
        state.userStats = action.payload.data || action.payload;
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const created = action.payload?.data || action.payload;
        if (created) {
          state.users.unshift(created);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset user password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUsers, setFilters, clearError, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
