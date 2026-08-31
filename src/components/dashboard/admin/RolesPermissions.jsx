import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import {
  fetchRolesWithPermissions,
  createRole,
  updateRolePermissions,
  deleteRole,
} from '../../../store/slices/menuPermissionsSlice';
import { DataGrid, Button, StatsCard } from '../../ui';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';
import { notify } from '../../../services/utils/authUtils';
import usePermissions from '../../../hooks/usePermissions';

const PERMISSION_META = {
  MENU_OVERVIEW:    'Overview',
  MENU_USERS:       'Users',
  MENU_CAMPUSES:    'Campuses',
  MENU_BOOKS:       'Books',
  MENU_COURSES:     'Courses',
  MENU_ORDERS:      'Orders',
  MENU_PAYMENTS:    'Payments',
  MENU_FORMS:       'Form Builder',
  MENU_SUBMISSIONS: 'Submissions',
  MENU_REPORTS:     'Reports',
};

const ALL_PERMISSIONS = Object.keys(PERMISSION_META);

const RoleFormModal = ({ open, title, initialData, onSave, onClose, isSaving }) => {
  const [roleName, setRoleName] = useState(initialData?.role || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [permissions, setPermissions] = useState(
    Array.isArray(initialData?.permissions) ? initialData.permissions : []
  );
  const isEdit = !!initialData?.role;

  useEffect(() => {
    setRoleName(initialData?.role || '');
    setDescription(initialData?.description || '');
    setPermissions(Array.isArray(initialData?.permissions) ? initialData.permissions : []);
  }, [initialData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Typography variant="h6" fontWeight="bold" color="#1f2937">{title}</Typography>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="e.g. MEDIA_ADMIN"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 bg-white"
              />
              <p className="mt-1 text-xs text-gray-400">Uppercase letters and underscores only. Will be auto-formatted.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 bg-white"
            />
          </div>

          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={permissions}
              onChange={(e) => setPermissions(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Permissions" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((key) => (
                    <Chip key={key} label={PERMISSION_META[key] || key} size="small" />
                  ))}
                </Box>
              )}
              sx={{ borderRadius: 2 }}
            >
              {ALL_PERMISSIONS.map((key) => (
                <MenuItem key={key} value={key}>{PERMISSION_META[key]}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ roleName, description, permissions })}
            disabled={isSaving || (!isEdit && !roleName.trim())}
            className="px-4 py-2 rounded-lg bg-[#003999] text-white text-sm font-semibold hover:bg-[#002d7a] disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RolesPermissions = () => {
  const dispatch = useDispatch();
  const { roles, isLoading, error } = useSelector((state) => state.menuPermissions);
  const { isSuperAdmin } = usePermissions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    dispatch(fetchRolesWithPermissions());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleSave = async ({ roleName, description, permissions }) => {
    setIsSaving(true);
    try {
      if (editingRole) {
        await dispatch(updateRolePermissions({ roleName: editingRole.role, permissionKeys: permissions })).unwrap();
        notify.success(`Permissions updated for ${editingRole.label}`);
      } else {
        await dispatch(createRole({ roleName, description, permissions })).unwrap();
        notify.success(`Role "${roleName}" created successfully`);
      }
      setModalOpen(false);
    } catch (err) {
      notify.error(err?.message || 'Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await dispatch(deleteRole(roleToDelete.role)).unwrap();
      notify.success(`Role "${roleToDelete.label}" deleted`);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      notify.error(err?.message || 'Failed to delete role');
    }
  };

  const rows = (roles || []).filter((r) => r.role !== 'SUPER_ADMIN').map((r) => ({
    id: r.role,
    role: r.role,
    label: r.label,
    description: r.description,
    permissions: Array.isArray(r.permissions) ? r.permissions : [],
  }));

  const dataGridActions = isSuperAdmin ? [
    {
      icon: <Edit size={16} />,
      tooltip: 'Edit Permissions',
      onClick: handleOpenEdit,
      color: '#003999',
    },
    {
      icon: <Trash2 size={16} />,
      tooltip: 'Delete Role',
      onClick: handleDeleteClick,
      color: '#dc2626',
    },
  ] : [];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load roles: {error?.message || 'Server error'}
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1f2937"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, lineHeight: 1.2 }}>
            Roles &amp; Permissions
          </Typography>
          <Typography variant="body1" color="#6b7280" sx={{ mt: 0.5 }}>
            Create roles, assign menu permissions, then apply roles to users
          </Typography>
        </Box>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
            sx={{
              backgroundColor: '#003999',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#002d7a' },
            }}
          >
            Add Role
          </Button>
        )}
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Roles" value={rows.length} icon={Shield} color="primary" />
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, backgroundColor: 'white' }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row.id}
          loading={isLoading}
          pagination
          paginationMode="client"
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          actions={dataGridActions}
          columns={[
            {
              field: 'label',
              headerName: 'Role',
              width: 180,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
                </Box>
              ),
            },
            {
              field: 'role',
              headerName: 'Key',
              width: 180,
              headerAlign: 'center',
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem', backgroundColor: '#f3f4f6', color: '#374151' }}
                />
              ),
            },
            {
              field: 'description',
              headerName: 'Description',
              flex: 1,
              minWidth: 200,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" color="#6b7280" sx={{ py: 1 }}>
                  {params.value || '—'}
                </Typography>
              ),
            },
            {
              field: 'permissions',
              headerName: 'Permissions',
              flex: 1.5,
              minWidth: 280,
              headerAlign: 'center',
              renderCell: (params) => {
                const perms = params.value || [];
                if (perms.length === 0) {
                  return <Chip label="No permissions" size="small" sx={{ backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '0.7rem' }} />;
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
                    {perms.slice(0, 3).map((p) => (
                      <Chip key={p} label={PERMISSION_META[p] || p} size="small"
                        sx={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.7rem' }} />
                    ))}
                    {perms.length > 3 && (
                      <Chip label={`+${perms.length - 3} more`} size="small"
                        sx={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '0.7rem' }} />
                    )}
                  </Box>
                );
              },
            },
          ]}
          sx={{ height: 500 }}
        />
      </Paper>

      <RoleFormModal
        open={modalOpen}
        title={editingRole ? `Edit Permissions — ${editingRole.label}` : 'Create New Role'}
        initialData={editingRole}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        isSaving={isSaving}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setRoleToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message="This will remove the role and all its permission assignments. Users assigned only this role will lose access."
        itemName={roleToDelete?.label}
        isLoading={isSaving}
      />
    </Box>
  );
};

export default RolesPermissions;
