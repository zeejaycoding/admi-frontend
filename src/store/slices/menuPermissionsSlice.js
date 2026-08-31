import { createSlice } from '@reduxjs/toolkit';
import apiClient from '../../services/utils/apiClient';
import {
  makeAsyncThunk,
  applyAsyncCases,
  setPending,
  setRejectedPayload,
} from './utils/asyncCaseHelpers';

export const fetchRolesWithPermissions = makeAsyncThunk(
  'menuPermissions/fetchRoles',
  async () => {
    const res = await apiClient.get('/permissions/roles');
    return res.data?.data || [];
  },
  'Failed to load roles'
);

export const fetchPermissionMatrix = makeAsyncThunk(
  'menuPermissions/fetchMatrix',
  async () => {
    const res = await apiClient.get('/permissions/matrix');
    return res.data?.data;
  },
  'Failed to load permissions'
);

export const createRole = makeAsyncThunk(
  'menuPermissions/createRole',
  async ({ roleName, description, permissions }) => {
    const res = await apiClient.post('/permissions/roles', { roleName, description, permissions });
    return res.data?.data;
  },
  'Failed to create role'
);

export const updateRolePermissions = makeAsyncThunk(
  'menuPermissions/updateRole',
  async ({ roleName, permissionKeys }) => {
    await apiClient.put(`/permissions/roles/${roleName}`, permissionKeys);
    return { roleName, permissionKeys };
  },
  'Failed to update permissions'
);

export const deleteRole = makeAsyncThunk(
  'menuPermissions/deleteRole',
  async (roleName) => {
    await apiClient.delete(`/permissions/roles/${roleName}`);
    return roleName;
  },
  'Failed to delete role'
);

const menuPermissionsSlice = createSlice({
  name: 'menuPermissions',
  initialState: {
    roles: [],
    matrix: {},
    allPermissions: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncCases(builder, fetchRolesWithPermissions, {
      onPending: setPending,
      onFulfilled: (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
        state.matrix = {};
        action.payload.forEach((r) => {
          state.matrix[r.role] = [...(r.permissions || [])];
        });
      },
      onRejected: setRejectedPayload,
    });
    applyAsyncCases(builder, fetchPermissionMatrix, {
      onFulfilled: (state, action) => {
        state.matrix = action.payload?.matrix || {};
        state.allPermissions = action.payload?.allPermissions || [];
      },
    });
    applyAsyncCases(builder, createRole, {
      onFulfilled: (state, action) => {
        state.roles.push(action.payload);
        state.matrix[action.payload.role] = [...(action.payload.permissions || [])];
      },
    });
    applyAsyncCases(builder, updateRolePermissions, {
      onFulfilled: (state, action) => {
        const { roleName, permissionKeys } = action.payload;
        state.matrix[roleName] = permissionKeys;
        const role = state.roles.find((r) => r.role === roleName);
        if (role) role.permissions = permissionKeys;
      },
    });
    applyAsyncCases(builder, deleteRole, {
      onFulfilled: (state, action) => {
        state.roles = state.roles.filter((r) => r.role !== action.payload);
        delete state.matrix[action.payload];
      },
    });
  },
});

export default menuPermissionsSlice.reducer;
