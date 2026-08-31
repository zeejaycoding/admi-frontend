import React from 'react';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
import { Box, Typography, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const DataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  pagination = {},
  paginationMode = 'server',
  page,
  pageSize,
  rowCount,
  onPageChange,
  onPageSizeChange,
  onSortModelChange,
  onRowClick,
  actions = [],
  getRowClassName,
  sx = {},
  ...props
}) => {
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState(null);
  const [actionMenuUser, setActionMenuUser] = React.useState(null);

  const handleActionMenuOpen = (event, user) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuUser(user);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuUser(null);
  };

  const defaultColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Typography variant="body2" fontWeight="medium" sx={{ textAlign: 'center' }}>
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'isEmailVerified',
      headerName: 'Verified',
      width: 100,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Chip
              label={params.row.isEmailVerified ? 'Yes' : 'No'}
              size="small"
              color={params.row.isEmailVerified ? 'success' : 'default'}
              sx={{ 
                fontSize: '0.7rem',
                height: 20,
                backgroundColor: params.row.isEmailVerified ? '#dcfce7' : '#f3f4f6',
                color: params.row.isEmailVerified ? '#059669' : '#6b7280',
                fontWeight: 500,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 0.8,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params || !params.row) return 'N/A';
        const firstName = params.row.firstName || '';
        const lastName = params.row.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Typography variant="body2" fontWeight="medium" sx={{ textAlign: 'center' }}>
              {fullName || 'N/A'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'region',
      headerName: 'Region',
      width: 120,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params) return null;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Chip
              label={params.value || 'N/A'}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: '#003999',
                color: '#003999',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#e6ecff',
                }
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 0.8,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params) return null;
        return (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            height: '100%',
            gap: 0.5,
            flexWrap: 'wrap'
          }}>
            {params.value?.map((role, index) => (
              <Chip
                key={index}
                label={typeof role === 'string' ? role : role.name}
                size="small"
                sx={{
                  backgroundColor: getRoleColor(typeof role === 'string' ? role : role.name),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                  fontWeight: 500,
                }}
              />
            )) || (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                No roles
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params) return null;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Chip
              label={params.value ? 'Active' : 'Inactive'}
              size="small"
              color={params.value ? 'success' : 'error'}
              icon={params.value ? <ActiveIcon /> : <InactiveIcon />}
              sx={{ 
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 150,
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params || !params.row) return 'N/A';
        
        const dateValue = params.row.createdAt;
        if (!dateValue) return 'N/A';
        
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return 'N/A';
          
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                {formattedDate}
              </Typography>
            </Box>
          );
        } catch (error) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                N/A
              </Typography>
            </Box>
          );
        }
      },
    },
  ];

  const getRoleColor = (roleName) => {
    const roleColors = {
      'SUPER_ADMIN': '#dc2626',
      'ADMIN': '#003999',
      'COORDINATOR': '#ea580c',
      'USER': '#2563eb',
      'STUDENT': '#059669',
      'CUSTOMER': '#4f46e5',
    };
    return roleColors[roleName] || '#6b7280';
  };

  // Always include actions column if actions are provided
  const baseColumns = columns.length > 0 ? columns : defaultColumns;
  
  // Check if actions column already exists in baseColumns
  const hasActionsColumn = baseColumns.some(col => col.field === 'actions');
  
  const mergedColumns = actions.length > 0 && !hasActionsColumn
    ? [...baseColumns, {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        headerAlign: 'center',
        renderCell: (params) => {
          if (!params || !params.row) return null;
          const availableActions = actions.filter(action => !action.condition || action.condition(params.row));
          
          if (availableActions.length === 0) return null;
          
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionMenuOpen(e, params.row);
                }}
                sx={{
                  color: '#003999',
                  '&:hover': {
                    backgroundColor: '#e6ecff',
                  },
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor) && actionMenuUser?.id === params.row.id}
                onClose={handleActionMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {availableActions.map((action, index) => (
                  <MenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(params.row);
                      handleActionMenuClose();
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: action.hoverColor || '#e6ecff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: action.color || '#003999' }}>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText primary={action.tooltip} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          );
        },
      }]
    : baseColumns;

  return (
    <Box sx={{ 
      height: { xs: 400, sm: 500, md: 600 }, 
      width: '100%', 
      minWidth: 0,
      overflow: 'hidden',
      ...sx 
    }}>
      <MuiDataGrid
        rows={rows}
        columns={mergedColumns}
        loading={loading}
        pagination
        paginationMode={paginationMode}
        rowCount={paginationMode === 'server' ? (pagination.totalElements || rowCount || 0) : undefined}
        page={paginationMode === 'server' ? (pagination.page || 0) : page}
        pageSize={paginationMode === 'server' ? (pagination.size || 20) : pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortModelChange={onSortModelChange}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          width: '100%',
         '& .MuiDataGrid-cell': {
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0 16px',
},
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            '& .MuiDataGrid-columnHeader': {
              borderRight: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:last-child': {
                borderRight: 'none',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                color: '#374151',
                textAlign: 'center',
              },
            },
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: '#e6ecff',
            },
            '&.Mui-selected': {
              backgroundColor: '#b3c5ff',
              '&:hover': {
                backgroundColor: '#809eff',
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            justifyContent: 'center',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: '#ffffff',
          },
        }}
        {...props}
      />
    </Box>
  );
};

export default DataGrid;