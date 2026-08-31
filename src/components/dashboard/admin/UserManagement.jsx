import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import usePermissions from '../../../hooks/usePermissions';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddRoleIcon,
  PersonRemove as RemoveRoleIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  People as UsersIcon,
  VerifiedUser as VerifiedIcon,
  Block as BlockedIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

import { DataGrid, Button, Modal, StatsCard } from '../../ui';
import AdminListLayout from './shared/AdminListLayout';
import { ROLE_LABELS } from '../../../constants/roles';
import {
  fetchAllUsers,
  activateUser,
  deactivateUser,
  assignUserRole,
  removeUserRole,
  createUser,
  resetUserPassword,
  clearError,
} from '../../../store/slices/userSlice';
import { notify } from '../../../services/utils/authUtils';
import userService from '../../../services/api/userService';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, isLoading, filters, pagination, error } = useSelector((state) => state.users);
  const { isSuperAdmin } = usePermissions();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [actionType, setActionType] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    roles: [],
    emailVerified: true,
    enabled: true,
  });
  const [createFormErrors, setCreateFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const [serverStats, setServerStats] = useState(null);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwUser, setPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [isSavingPw, setIsSavingPw] = useState(false);

  const adminCreatedUsers = React.useMemo(() => (users || []).filter(u => u.createdByAdmin), [users]);
  const registeredUsers = React.useMemo(() => (users || []).filter(u => !u.createdByAdmin), [users]);
  const tabUsers = activeTab === 0 ? adminCreatedUsers : registeredUsers;

  const computedStats = React.useMemo(() => ({
    totalUsers: serverStats?.totalUsers ?? pagination?.totalElements ?? 0,
    activeUsers: serverStats?.activeUsers ?? 0,
    inactiveUsers: serverStats ? (serverStats.totalUsers - serverStats.activeUsers) : 0,
    newUsersThisMonth: serverStats?.newUsersThisMonth ?? 0,
  }), [serverStats, pagination]);

  const filteredUsers = React.useMemo(() => {
    if (!tabUsers || !searchTerm.trim()) return tabUsers;
    const q = searchTerm.toLowerCase().trim();
    return tabUsers.filter(u =>
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.region || '').toLowerCase().includes(q) ||
      (u.roles || []).join(' ').toLowerCase().includes(q)
    );
  }, [tabUsers, searchTerm]);

  useEffect(() => {
    dispatch(fetchAllUsers({ ...filters, size: 500 }));
    userService.getUserStatistics().then(res => setServerStats(res?.data || null)).catch(() => {});
  }, [filters, dispatch]);

  const openCreateModal = async () => {
    setCreateModalOpen(true);
    try {
      const res = await userService.getAvailableRoles();
      setAvailableRoles(res?.data || []);
    } catch {
      notify.error('Could not load roles. Please try again.');
    }
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateForm({ fullName: '', email: '', password: '', roles: [], emailVerified: true, enabled: true });
    setCreateFormErrors({});
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.fullName.trim()) errors.fullName = 'Required';
    if (!createForm.email.trim()) errors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) errors.email = 'Invalid email';
    if (!createForm.password.trim()) errors.password = 'Required';
    else if (createForm.password.length < 6) errors.password = 'Min 6 characters';
    if (createForm.roles.length === 0) errors.roles = 'Select at least one role';
    return errors;
  };

  const handleCreateUser = async () => {
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) { setCreateFormErrors(errors); return; }
    setIsCreating(true);
    try {
      await dispatch(createUser({
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        roles: createForm.roles,
        emailVerified: createForm.emailVerified,
        enabled: createForm.enabled,
      })).unwrap();
      notify.success(`User ${createForm.fullName} created successfully!`);
      closeCreateModal();
      dispatch(fetchAllUsers({ ...filters, size: 500 }));
    } catch (err) {
      notify.error(err?.message || 'Failed to create user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    dispatch(clearError());
    dispatch(fetchAllUsers({ ...filters, size: 500 }));
    notify.info('User list refreshed!');
  };

  const handleActivateUser = async (user) => {
    try {
      await dispatch(activateUser(user.id)).unwrap();
      dispatch(fetchAllUsers({ ...filters, size: 500 }));
      notify.success(`${user.fullName} activated successfully!`);
    } catch {
      notify.error('Failed to activate user. Please try again.');
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      await dispatch(deactivateUser(user.id)).unwrap();
      dispatch(fetchAllUsers({ ...filters, size: 500 }));
      notify.success(`${user.fullName} deactivated successfully!`);
    } catch {
      notify.error('Failed to deactivate user. Please try again.');
    }
  };

  const handleRoleAction = async (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setSelectedRoles([]);
    setRoleModalOpen(true);
    try {
      const res = await userService.getAvailableRoles();
      setRoleOptions(res?.data || []);
    } catch {
      notify.error('Could not load roles.');
    }
  };

  const handleRoleSubmit = async () => {
    if (!selectedUser || selectedRoles.length === 0) return;
    try {
      await Promise.all(
        selectedRoles.map((roleName) =>
          actionType === 'assign'
            ? dispatch(assignUserRole({ userId: selectedUser.id, roleName })).unwrap()
            : dispatch(removeUserRole({ userId: selectedUser.id, roleName })).unwrap()
        )
      );
      const verb = actionType === 'assign' ? 'assigned to' : 'removed from';
      notify.success(`${selectedRoles.length} role(s) ${verb} ${selectedUser.fullName}!`);
      setRoleModalOpen(false);
      setSelectedRoles([]);
      setSelectedUser(null);
      dispatch(fetchAllUsers({ ...filters, size: 500 }));
    } catch {
      notify.error('Failed to update user roles. Please try again.');
    }
  };

  const openPwModal = (user) => {
    setPwUser(user);
    setNewPassword('');
    setPwError('');
    setPwModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (newPassword.trim().length < 6) { setPwError('Minimum 6 characters'); return; }
    setIsSavingPw(true);
    try {
      await dispatch(resetUserPassword({ userId: pwUser.id, newPassword })).unwrap();
      notify.success(`Password reset for ${pwUser.fullName}`);
      setPwModalOpen(false);
    } catch (err) {
      notify.error(err?.message || 'Failed to reset password');
    } finally {
      setIsSavingPw(false);
    }
  };

  const dataGridActions = [
    {
      icon: <AddRoleIcon />,
      tooltip: 'Assign Role',
      onClick: (user) => handleRoleAction(user, 'assign'),
      color: '#059669',
    },
    {
      icon: <RemoveRoleIcon />,
      tooltip: 'Remove Role',
      onClick: (user) => handleRoleAction(user, 'remove'),
      color: '#dc2626',
    },
  ];

  if (isSuperAdmin) {
    dataGridActions.push(
      {
        icon: <LockIcon />,
        tooltip: 'Reset Password',
        onClick: openPwModal,
        color: '#005FFF',
      },
      {
        icon: <ActivateIcon />,
        tooltip: 'Activate User',
        onClick: handleActivateUser,
        color: '#059669',
        condition: (user) => !user.isActive,
      },
      {
        icon: <DeactivateIcon />,
        tooltip: 'Deactivate User',
        onClick: handleDeactivateUser,
        color: '#dc2626',
        condition: (user) => user.isActive,
      }
    );
  }

  const headerAction = isSuperAdmin ? (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={openCreateModal}
      sx={{ backgroundColor: '#003999', color: 'white', px: 3, py: 1, borderRadius: 2, fontWeight: 600, textTransform: 'none', '&:hover': { backgroundColor: '#002d7a' } }}
    >
      Add User
    </Button>
  ) : null;

  const statsGrid = (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 2.5 }, width: '100%' }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Total Users" value={computedStats.totalUsers} icon={UsersIcon} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Active Users" value={computedStats.activeUsers} icon={VerifiedIcon} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Inactive Users" value={computedStats.inactiveUsers} icon={BlockedIcon} color="error" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="New This Month" value={computedStats.newUsersThisMonth} icon={TrendingIcon} color="warning" />
      </Grid>
    </Grid>
  );

  const toolbar = (
    <>
      <TextField
        placeholder="Search users by name, email, or region..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7280' }} /></InputAdornment> }}
        sx={{ flex: 1, minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        size="small"
      />
      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        disabled={isLoading}
        size="small"
        sx={{ backgroundColor: '#003999', color: 'white', px: 3, py: 1, borderRadius: 2, fontWeight: 600, textTransform: 'none', '&:hover': { backgroundColor: '#002d7a' }, '&:disabled': { backgroundColor: '#9ca3af', color: '#6b7280' } }}
      >
        Refresh
      </Button>
    </>
  );

  return (
    <AdminListLayout
      title="User Management"
      subtitle="Manage user accounts, roles, and permissions across the platform"
      headerAction={headerAction}
      stats={statsGrid}
      toolbar={toolbar}
      error={error}
      errorMessage="An error occurred while loading users"
      extra={
        <>
          <Modal
            open={roleModalOpen}
            onClose={() => { setRoleModalOpen(false); setSelectedRoles([]); setSelectedUser(null); }}
            title={`${actionType === 'assign' ? 'Assign' : 'Remove'} Roles`}
            actions={
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                <Button variant="outlined" onClick={() => { setRoleModalOpen(false); setSelectedRoles([]); setSelectedUser(null); }}
                  sx={{ borderColor: '#003999', color: '#003999', fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { borderColor: '#002d7a', backgroundColor: '#e6ecff' } }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleRoleSubmit} disabled={selectedRoles.length === 0}
                  sx={{ backgroundColor: '#003999', color: '#ffffff', fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { backgroundColor: '#002d7a' }, '&:disabled': { backgroundColor: '#d1d5db !important', color: '#6b7280 !important' } }}>
                  {actionType === 'assign' ? 'Assign Roles' : 'Remove Roles'}
                </Button>
              </Box>
            }
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                {actionType === 'assign' ? 'Assign roles to' : 'Remove roles from'}{' '}
                <strong>{selectedUser?.email}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Roles</InputLabel>
                <Select
                  multiple
                  value={selectedRoles}
                  onChange={(e) => setSelectedRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Select Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((v) => <Chip key={v} label={ROLE_LABELS[v] || v} size="small" />)}
                    </Box>
                  )}
                  sx={{ borderRadius: 2 }}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role.roleName} value={role.roleName}>
                      {role.label || ROLE_LABELS[role.roleName] || role.roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Modal>

          <Modal
            open={pwModalOpen}
            onClose={() => setPwModalOpen(false)}
            title="Reset User Password"
            actions={
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                <Button variant="outlined" onClick={() => setPwModalOpen(false)}
                  sx={{ borderColor: '#003999', color: '#003999', fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { borderColor: '#002d7a', backgroundColor: '#e6ecff' } }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleResetPassword} disabled={isSavingPw}
                  sx={{ backgroundColor: '#003999', color: '#ffffff', fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { backgroundColor: '#002d7a' }, '&:disabled': { backgroundColor: '#d1d5db !important', color: '#6b7280 !important' } }}>
                  {isSavingPw ? 'Saving...' : 'Reset Password'}
                </Button>
              </Box>
            }
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
                Set a new password for <strong>{pwUser?.fullName}</strong> ({pwUser?.email})
              </Typography>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPwError(''); }}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
                    ${pwError ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-600 bg-white'}`}
                />
                {pwError
                  ? <p className="mt-1 text-xs text-red-500">{pwError}</p>
                  : <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>}
              </div>
            </Box>
          </Modal>

          <Modal
            open={createModalOpen}
            onClose={closeCreateModal}
            title="Add New User"
            maxWidth="md"
            actions={
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                <Button variant="outlined" onClick={closeCreateModal}
                  sx={{ borderColor: '#003999', color: '#003999', fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { borderColor: '#002d7a', backgroundColor: '#e6ecff' } }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleCreateUser} disabled={isCreating}
                  sx={{ backgroundColor: '#003999', color: '#ffffff', fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: 2, '&:hover': { backgroundColor: '#002d7a' }, '&:disabled': { backgroundColor: '#d1d5db !important', color: '#6b7280 !important' } }}>
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
              </Box>
            }
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Personal Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={createForm.fullName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${createFormErrors.fullName ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-600 bg-white'}`} />
                    {createFormErrors.fullName && <p className="mt-1 text-xs text-red-500">{createFormErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={createForm.email}
                      onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${createFormErrors.email ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-600 bg-white'}`} />
                    {createFormErrors.email && <p className="mt-1 text-xs text-red-500">{createFormErrors.email}</p>}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Account Security</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={createForm.password}
                      onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                      autoComplete="new-password"
                      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${createFormErrors.password ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-600 bg-white'}`} />
                    {createFormErrors.password
                      ? <p className="mt-1 text-xs text-red-500">{createFormErrors.password}</p>
                      : <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>}
                  </div>
                </div>
                <FormControl fullWidth error={!!createFormErrors.roles}>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={createForm.roles}
                    onChange={(e) => setCreateForm((f) => ({ ...f, roles: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value }))}
                    input={<OutlinedInput label="Roles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((v) => <Chip key={v} label={ROLE_LABELS[v] || v} size="small" />)}
                      </Box>
                    )}
                    sx={{ borderRadius: 2 }}
                  >
                    {availableRoles.map((role) => (
                      <MenuItem key={role.roleName} value={role.roleName}>
                        {role.label || ROLE_LABELS[role.roleName] || role.roleName}
                      </MenuItem>
                    ))}
                  </Select>
                  {createFormErrors.roles && <p className="mt-1 text-xs text-red-500">{createFormErrors.roles}</p>}
                </FormControl>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Account Settings</p>
                <div className="flex flex-wrap gap-6 px-4 py-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setCreateForm((f) => ({ ...f, emailVerified: !f.emailVerified }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${createForm.emailVerified ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${createForm.emailVerified ? 'translate-x-4' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm text-gray-700">Email Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setCreateForm((f) => ({ ...f, enabled: !f.enabled }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${createForm.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${createForm.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </Modal>
        </>
      }
    >
      <Box sx={{ borderBottom: '1px solid #e5e7eb', px: 2, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => { setActiveTab(v); setPage(0); setSearchTerm(''); }}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', color: '#6b7280' },
              '& .Mui-selected': { color: '#003999' },
              '& .MuiTabs-indicator': { backgroundColor: '#003999' },
            }}
          >
            <Tab label={`Admin Created (${adminCreatedUsers.length})`} />
            <Tab label={`Self Registered (${registeredUsers.length})`} />
          </Tabs>
        </Box>

        <DataGrid
          key={`users-${activeTab}-${filteredUsers?.length || 0}-${searchTerm}`}
          rows={filteredUsers || []}
          loading={isLoading}
          pagination
          paginationMode="client"
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
          actions={dataGridActions}
          getRowClassName={(params) => !params.row.isActive ? 'inactive-user' : ''}
          sx={{
            height: 560,
            '& .inactive-user': { backgroundColor: '#fef2f2', '&:hover': { backgroundColor: '#fee2e2' } },
          }}
        />
    </AdminListLayout>
  );
};

export default UserManagement;
