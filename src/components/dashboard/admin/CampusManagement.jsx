import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import usePermissions from '../../../hooks/usePermissions';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Star as FeaturedIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

import { DataGrid, Button, Modal, StatsCard } from '../../ui';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';
import AdminListLayout from './shared/AdminListLayout';
import {
  fetchAllCampuses,
  searchCampuses,
  deleteCampus,
  clearError,
  setFilters,
  resetFilters,
} from '../../../store/slices/campusSlice';
import { notify } from '../../../services/utils/authUtils';
import campusService from '../../../services/api/campusService';
import CampusCreate from '../../campus/admin/CampusCreate';
import CampusEdit from '../../campus/admin/CampusEdit';
import CampusUploadImage from '../../campus/admin/CampusUploadImage';

// Address Cell — defined at module scope so it isn't recreated (and remounted,
// losing its `copied` state) on every CampusManagement render.
const AddressCell = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can copy manually
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          backgroundColor: '#f3f4f6',
          borderRadius: 1,
        }
      }}
      onClick={handleCopyAddress}
      title="Click to copy full address"
    >
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: copied ? '#059669' : 'inherit',
          fontWeight: copied ? 600 : 400,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value || 'N/A'}
      </Typography>
      {copied && (
        <Box
          sx={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#059669',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 1,
            fontSize: '0.7rem',
            fontWeight: 500,
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          ✓ Copied!
        </Box>
      )}
    </Box>
  );
};

const CampusManagement = () => {
  const dispatch = useDispatch();
  const { campuses, isLoading, filters, error, totalPages, totalElements } = useSelector((state) => state.campus);
  const { canManage } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campusToDelete, setCampusToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [serverStats, setServerStats] = useState(null);

  const computedStats = React.useMemo(() => ({
    totalCampuses: serverStats?.totalCampuses ?? totalElements ?? 0,
    activeCampuses: serverStats?.activeCampuses ?? 0,
    featuredCampuses: serverStats?.featuredCampuses ?? 0,
    totalRegions: serverStats?.totalRegions ?? 0,
  }), [serverStats, totalElements]);

  useEffect(() => {
    campusService.getCampusStats().then(res => setServerStats(res?.data || null)).catch(() => {});
  }, []);

  // Fetch campuses on component mount and when filters change
  useEffect(() => {
    const currentFilters = {
      page,
      size: pageSize,
      sortBy: 'name',
      sortDirection: 'asc',
    };
    dispatch(fetchAllCampuses(currentFilters));
  }, [dispatch, page, pageSize]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const searchFilters = {
          page: 0,
          size: pageSize,
          sortBy: 'name',
          sortDirection: 'asc',
          searchTerm: searchTerm.trim(),
        };
        dispatch(searchCampuses(searchFilters));
        setPage(0);
      } else if (searchTerm === '') {
        // Reset to default filters when search is cleared
        const defaultFilters = {
          page: 0,
          size: pageSize,
          sortBy: 'name',
          sortDirection: 'asc',
        };
        dispatch(setFilters(defaultFilters));
        dispatch(fetchAllCampuses(defaultFilters));
        setPage(0);
      }
    }, searchTerm ? 500 : 0); // 500ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pageSize, dispatch]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const searchFilters = {
        page: 0,
        size: pageSize,
        sortBy: 'name',
        sortDirection: 'asc',
        searchTerm: searchTerm.trim(),
      };
      dispatch(searchCampuses(searchFilters));
      setPage(0);
    } else {
      // If search is empty, show all campuses
      const defaultFilters = {
        page: 0,
        size: pageSize,
        sortBy: 'name',
        sortDirection: 'asc',
      };
      dispatch(setFilters(defaultFilters));
      dispatch(fetchAllCampuses(defaultFilters));
      setPage(0);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    dispatch(clearError());
    dispatch(resetFilters());
    const defaultFilters = {
      page: 0,
      size: pageSize,
      sortBy: 'name',
      sortDirection: 'asc',
    };
    dispatch(fetchAllCampuses(defaultFilters));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteCampus = (campus) => {
    setCampusToDelete(campus);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campusToDelete) return;
    
    try {
      await dispatch(deleteCampus(campusToDelete.id)).unwrap();
      // Refresh the current page after deletion
      const currentFilters = {
        ...filters,
        page,
        size: pageSize,
      };
      dispatch(fetchAllCampuses(currentFilters));
      setDeleteModalOpen(false);
      setCampusToDelete(null);
      notify.success(`Campus "${campusToDelete.name}" deleted successfully!`);
    } catch (error) {
      notify.error('Failed to delete campus. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCampusToDelete(null);
  };

  const handleEditCampus = (campus) => {
    setSelectedCampus(campus);
    setEditModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    // Refresh the current page after creation
    const currentFilters = {
      ...filters,
      page,
      size: pageSize,
    };
    dispatch(fetchAllCampuses(currentFilters));
    notify.success('Campus created successfully!');
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedCampus(null);
    // Refresh the current page after edit
    const currentFilters = {
      ...filters,
      page,
      size: pageSize,
    };
    dispatch(fetchAllCampuses(currentFilters));
    notify.success('Campus updated successfully!');
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    setSelectedCampus(null);
    // Refresh the current page after upload
    const currentFilters = {
      ...filters,
      page,
      size: pageSize,
    };
    dispatch(fetchAllCampuses(currentFilters));
    notify.success('Campus image uploaded successfully!');
  };

  const handleUploadImage = (campus) => {
    setSelectedCampus(campus);
    setUploadModalOpen(true);
  };

  const dataGridActions = canManage ? [
    {
      icon: <EditIcon />,
      tooltip: 'Edit Campus',
      onClick: handleEditCampus,
      color: '#059669',
    },
    {
      icon: <DeleteIcon />,
      tooltip: 'Delete Campus',
      onClick: handleDeleteCampus,
      color: '#dc2626',
    },
  ] : [];

  const statsGrid = (
    <Grid
      container
      spacing={{ xs: 2, sm: 2, md: 3 }}
      sx={{
        mb: { xs: 2, sm: 2.5 },
        width: '100%'
      }}
    >
      <Grid item xs={12} sm={6} md={4}>
        <StatsCard title="Total Campuses" value={computedStats.totalCampuses} icon={LocationIcon} color="primary" />
      </Grid>
    </Grid>
  );

  const toolbar = (
    <>
          <TextField
            placeholder="Search campuses by name, city, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            size="small"
          />
          
          {/* <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={isLoading}
            size="small"
            sx={{ 
              backgroundColor: '#2563eb',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#6b7280',
              }
            }}
          >
            Search
          </Button> */}
          
          {canManage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              size="small"
              sx={{
                backgroundColor: '#059669',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#047857' },
              }}
            >
              Add Campus
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            size="small"
            sx={{ 
              backgroundColor: '#003999',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#002d7a',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#6b7280',
              }
            }}
          >
            Refresh
          </Button>
    </>
  );

  return (
    <AdminListLayout
      title="Campus Management"
      subtitle="Manage campus locations, information, and settings across the platform"
      stats={statsGrid}
      toolbar={toolbar}
      error={error}
      errorMessage="An error occurred while loading campuses"
      extra={
        <>
          {/* Create Campus Modal */}
          <Modal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title="Create New Campus"
            maxWidth="md"
            fullWidth
          >
            <CampusCreate onSuccess={handleCreateSuccess} onCancel={() => setCreateModalOpen(false)} />
          </Modal>

          {/* Edit Campus Modal */}
          <Modal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedCampus(null);
            }}
            title="Edit Campus"
            maxWidth="md"
            fullWidth
          >
            <CampusEdit
              campus={selectedCampus}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setEditModalOpen(false);
                setSelectedCampus(null);
              }}
            />
          </Modal>

          {/* Upload Image Modal */}
          <Modal
            open={uploadModalOpen}
            onClose={() => {
              setUploadModalOpen(false);
              setSelectedCampus(null);
            }}
            title="Upload Campus Image"
            maxWidth="md"
            fullWidth
          >
            <CampusUploadImage
              campus={selectedCampus}
              onSuccess={handleUploadSuccess}
              onCancel={() => {
                setUploadModalOpen(false);
                setSelectedCampus(null);
              }}
            />
          </Modal>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Delete Campus"
            message="This will permanently delete the campus and all associated data. This action cannot be undone."
            itemName={campusToDelete?.name}
            isLoading={isLoading}
          />
        </>
      }
    >
        <DataGrid
          key={`campuses-${Array.isArray(campuses) ? campuses.length : 0}-${searchTerm}-${page}-${totalElements}`}
          rows={Array.isArray(campuses) ? campuses : []}
          getRowId={(row) => row.id}
          rowCount={totalElements || 0}
          pageCount={totalPages || 0}
          paginationMode="server"
          columns={[
            {
              field: 'name',
              headerName: 'Campus Name',
              flex: 1,
              minWidth: 200,
              headerAlign: 'center',
            },
            {
              field: 'city',
              headerName: 'City',
              width: 120,
              headerAlign: 'center',
            },
            {
              field: 'region',
              headerName: 'Region',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
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
              ),
            },
            {
              field: 'phoneNumber',
              headerName: 'Phone',
              width: 140,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                  <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    {params.value || 'N/A'}
                  </Typography>
                </Box>
              ),
            },
            {
              field: 'currency',
              headerName: 'Currency',
              width: 100,
              headerAlign: 'center',
            },
            {
              field: 'fullAddress',
              headerName: 'Address',
              width: 200,
              headerAlign: 'center',
              renderCell: (params) => <AddressCell value={params.value} />,
            },
            {
              field: 'isActive',
              headerName: 'Status',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
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
              ),
            },
            {
              field: 'isFeatured',
              headerName: 'Featured',
              width: 100,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                  <Chip
                    label={params.value ? 'Yes' : 'No'}
                    size="small"
                    color={params.value ? 'warning' : 'default'}
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 20,
                      backgroundColor: params.value ? '#fef3c7' : '#f3f4f6',
                      color: params.value ? '#d97706' : '#6b7280',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              ),
            },
          ]}
          loading={isLoading}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
          actions={dataGridActions}
          getRowClassName={(params) => 
            !params.row.isActive ? 'inactive-campus' : ''
          }
          sx={{
            height: 600,
            '& .inactive-campus': {
              backgroundColor: '#fef2f2',
              '&:hover': {
                backgroundColor: '#fee2e2',
              },
            },
          }}
        />
    </AdminListLayout>
  );
};

export default CampusManagement;
