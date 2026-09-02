import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, MoreVertical, Search, Building2, RefreshCw } from 'lucide-react';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '../../ui';
import { notify } from '../../../services/utils/authUtils';
import {
  fetchManagementStats,
  fetchManagementCampuses,
  updateCampus,
  clearError,
} from '../../../store/slices/campusSlice';
import userService from '../../../services/api/userService';

const CampusManagementDashboard = () => {
  const dispatch = useDispatch();
  const {
    managementStats,
    managementCampuses,
    managementTotalPages,
    managementTotalElements,
    isManagementLoading,
    error,
  } = useSelector((state) => state.campus);

  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingCoordinator, setIsSavingCoordinator] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [coordinators, setCoordinators] = useState([]);
  const [isLoadingCoordinators, setIsLoadingCoordinators] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchManagementStats());
    dispatch(fetchManagementCampuses({ page, size: pageSize, sortBy: 'name', sortDirection: 'asc' }));
  }, [dispatch, page, pageSize]);

  useEffect(() => {
    if (error) {
      notify.error(error.message || 'An error occurred');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        dispatch(fetchManagementCampuses({
          page: 0,
          size: pageSize,
          sortBy: 'name',
          sortDirection: 'asc',
          searchTerm: searchTerm.trim(),
        }));
        setPage(0);
      } else if (searchTerm === '') {
        dispatch(fetchManagementCampuses({
          page: 0,
          size: pageSize,
          sortBy: 'name',
          sortDirection: 'asc',
        }));
        setPage(0);
      }
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pageSize, dispatch]);

  const fetchCoordinators = useCallback(async () => {
    setIsLoadingCoordinators(true);
    try {
      const response = await userService.getAllUsers({ size: 100 });
      const users = response.data?.users || response.data?.content || response.data || [];
      const allUsers = Array.isArray(users) ? users : [];
      const hasCoordinatorRole = (user) =>
        (user.roles || []).some(
          (r) => (typeof r === 'string' ? r : r?.name || r?.role || '') === 'COORDINATOR'
        );
      setCoordinators(allUsers.filter(hasCoordinatorRole));
    } catch (err) {
      notify.error('Failed to load coordinators');
    } finally {
      setIsLoadingCoordinators(false);
    }
  }, []);

  const handleExportPDF = () => {
    if (managementCampuses.length === 0) {
      notify.error('No campuses to export.');
      return;
    }
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.setTextColor(1, 26, 90);
      doc.text('Campus Management Report', 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, 14, 23);

      autoTable(doc, {
        startY: 30,
        head: [['Campus Name', 'Location', 'Coordinator', 'Member Count', 'Status']],
        body: managementCampuses.map((c) => [
          c.name,
          c.location || `${c.city || ''}, ${c.region || ''}`,
          c.coordinatorName || c.coordinator || 'Unassigned',
          c.memberCount || c.memberCount || 0,
          c.status === 'under_review' ? 'Under Review' : (c.status || (c.isActive ? 'Active' : 'Inactive')).charAt(0).toUpperCase() + (c.status || (c.isActive ? 'Active' : 'Inactive')).slice(1),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [1, 26, 90] },
        styles: { fontSize: 8 },
      });

      doc.save(`Campus-Management-${new Date().toISOString().split('T')[0]}.pdf`);
      notify.success('Campus data exported to PDF.');
    } catch (err) {
      notify.error('PDF export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (managementCampuses.length === 0) {
      notify.error('No campuses to export.');
      return;
    }
    setIsExporting(true);
    try {
      const headers = ['Campus Name', 'Location', 'Coordinator', 'Member Count', 'Status'];
      const escape = (v) => {
        const str = v == null ? '' : String(v);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const rows = managementCampuses.map((c) =>
        [
          c.name,
          c.location || `${c.city || ''}, ${c.region || ''}`,
          c.coordinatorName || c.coordinator || 'Unassigned',
          c.memberCount || 0,
          c.status === 'under_review' ? 'Under Review' : (c.status || (c.isActive ? 'Active' : 'Inactive')).charAt(0).toUpperCase() + (c.status || (c.isActive ? 'Active' : 'Inactive')).slice(1),
        ]
          .map(escape)
          .join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Campus-Management-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success('Campus data exported to CSV.');
    } catch (err) {
      notify.error('CSV export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleActionClick = (event, campus) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampus(campus);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  const handleAssignCoordinator = () => {
    handleActionClose();
    setSelectedCoordinator(selectedCampus?.coordinatorId || selectedCampus?.coordinator || '');
    setCoordinatorModalOpen(true);
    fetchCoordinators();
  };

  const handleCoordinatorModalClose = () => {
    setCoordinatorModalOpen(false);
    setSelectedCoordinator('');
  };

  const handleSaveCoordinator = async () => {
    if (!selectedCampus || !selectedCoordinator) return;

    const coordinator = coordinators.find(
      (c) => String(c.id) === String(selectedCoordinator),
    );
    if (!coordinator) {
      notify.error('Selected coordinator not found');
      return;
    }

    setIsSavingCoordinator(true);
    try {
      await dispatch(
        updateCampus({
          id: selectedCampus.id,
          campusData: {
            coordinator: coordinator.fullName || coordinator.name || coordinator.email,
            coordinatorEmail: coordinator.email,
          },
        }),
      ).unwrap();

      notify.success('Coordinator assigned successfully!');
      dispatch(fetchManagementStats());
      dispatch(fetchManagementCampuses({ page, size: pageSize, sortBy: 'name', sortDirection: 'asc' }));
      handleCoordinatorModalClose();
    } catch (err) {
      notify.error(err.message || 'Failed to assign coordinator');
    } finally {
      setIsSavingCoordinator(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    dispatch(fetchManagementStats());
    dispatch(fetchManagementCampuses({ page: 0, size: pageSize, sortBy: 'name', sortDirection: 'asc' }));
  };

  const getCampusStatus = (campus) => {
    if (!campus) return 'active';
    if (campus.status) return campus.status;
    if (campus.isActive === true) return 'active';
    if (campus.isActive === false) return 'inactive';
    return 'active';
  };

  const getCampusLocation = (campus) => {
    if (!campus) return '';
    if (campus.location) return campus.location;
    return [campus.city, campus.region, campus.country].filter(Boolean).join(', ');
  };

  const getCoordinatorName = (campus) => {
    if (!campus) return 'Unassigned';
    if (campus.coordinatorName) return campus.coordinatorName;
    if (campus.coordinator) return campus.coordinator;
    if (campus.coordinatorFullName) return campus.coordinatorFullName;
    return 'Unassigned';
  };

  const statusColorMap = {
    active: { bg: '#DCFCE7', color: '#00A63E' },
    under_review: { bg: '#FFF7ED', color: '#F54900' },
    inactive: { bg: '#F3F4F6', color: '#4A5565' },
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Campus Name',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      renderHeader: () => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
          Campus Name
        </span>
      ),
      renderCell: (params) => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 180,
      headerAlign: 'left',
      valueGetter: (value, row) => getCampusLocation(row),
      renderHeader: () => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
          Location
        </span>
      ),
      renderCell: (params) => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px' }}>
          {params.value || getCampusLocation(params.row)}
        </span>
      ),
    },
    {
      field: 'coordinator',
      headerName: 'Coordinator',
      flex: 1,
      minWidth: 180,
      headerAlign: 'left',
      valueGetter: (value, row) => getCoordinatorName(row),
      renderHeader: () => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
          Coordinator
        </span>
      ),
      renderCell: (params) => {
        const name = params.value || getCoordinatorName(params.row);
        const isUnassigned = name === 'Unassigned' || !name;
        return (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: isUnassigned ? '#F54900' : '#0A0A0A',
            }}
          >
            {name}
          </span>
        );
      },
    },
    {
      field: 'memberCount',
      headerName: 'Member Count',
      width: 130,
      headerAlign: 'center',
      renderHeader: () => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
          Member Count
        </span>
      ),
      renderCell: (params) => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px' }}>
          {params.value || 0}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      headerAlign: 'center',
      valueGetter: (value, row) => getCampusStatus(row),
      renderHeader: () => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
          Status
        </span>
      ),
      renderCell: (params) => {
        const status = params.value || getCampusStatus(params.row);
        const statusStyle = statusColorMap[status] || statusColorMap.active;
        const label = status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              height: 28,
            }}
          />
        );
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 80,
      headerAlign: 'center',
      sortable: false,
      renderHeader: () => (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
          Action
        </span>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <Box
            sx={{
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { backgroundColor: '#f3f4f6' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick(e, params.row);
            }}
          >
            <MoreVertical size={18} color="#6B7280" />
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-black font-bold"
            style={{ fontSize: '24px', fontFamily: 'Inter, sans-serif' }}
          >
            Campus Management
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              color: '#474C59',
            }}
            className="mt-1"
          >
            View and manage all campuses within your assigned country or region
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} />}
            onClick={handleRefresh}
            disabled={isManagementLoading}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#504F4F',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
              px: { xs: 2, sm: 3 },
              py: 1.2,
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              '&:hover': {
                backgroundColor: '#F3F4F6',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} color="#504F4F" />}
            onClick={handleExportPDF}
            disabled={isExporting || isManagementLoading}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#504F4F',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
              px: { xs: 2, sm: 3 },
              py: 1.2,
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              '&:hover': {
                backgroundColor: '#F3F4F6',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            Export to PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} color="#FFFFFF" />}
            onClick={handleExportCSV}
            disabled={isExporting || isManagementLoading}
            sx={{
              backgroundColor: '#011A5A',
              color: '#FFFFFF',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
              px: { xs: 2, sm: 3 },
              py: 1.2,
              borderRadius: '10px',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              '&:hover': {
                backgroundColor: '#011A5A',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-black/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Campuses', value: managementStats.total, color: '#0A0A0A' },
            { title: 'Active', value: managementStats.active, color: '#00A63E' },
            { title: 'Under Review', value: managementStats.underReview, color: '#F54900' },
            { title: 'Inactive', value: managementStats.inactive, color: '#4A5565' },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-lg p-5 border border-[#0000001A]"
            >
              <p
                className="text-[#0A0A0A]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                {stat.title}
              </p>
              <p
                style={{
                  fontSize: '24px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  color: stat.color,
                  lineHeight: 1.2,
                }}
                className="mt-2"
              >
                {isManagementLoading ? <CircularProgress size={20} /> : stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campuses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl shadow-sm">
        {isManagementLoading && managementCampuses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ color: '#003999' }} />
          </Box>
        ) : (
          <MuiDataGrid
            rows={managementCampuses}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            paginationMode="server"
            rowCount={managementTotalElements || 0}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(0);
            }}
            loading={isManagementLoading}
            sx={{
              border: 'none',
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#F3F4F6',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #E5E7EB',
              },
            }}
          />
        )}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          sx: {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)',
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleAssignCoordinator}>
          <ListItemIcon>
            <Building2 size={18} color="#3163EC" />
          </ListItemIcon>
          <ListItemText
            primary={getCoordinatorName(selectedCampus) === 'Unassigned' ? 'Assign Coordinator' : 'Update Coordinator'}
            primaryTypographyProps={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
            }}
          />
        </MenuItem>
      </Menu>

      <Dialog
        open={coordinatorModalOpen}
        onClose={handleCoordinatorModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#003999',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {getCoordinatorName(selectedCampus) === 'Unassigned' ? 'Assign Coordinator' : 'Update Coordinator'}
          <Box
            onClick={handleCoordinatorModalClose}
            sx={{
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ mb: 3 }}>
            <p
              style={{
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#0A0A0A',
              }}
              className="mb-1"
            >
              Campus
            </p>
            <p
              style={{
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                color: '#4A5565',
              }}
            >
              {selectedCampus?.name} — {getCampusLocation(selectedCampus)}
            </p>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel
              sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              Select Coordinator
            </InputLabel>
            {isLoadingCoordinators ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                value={selectedCoordinator}
                onChange={(e) => setSelectedCoordinator(e.target.value)}
                label="Select Coordinator"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="" sx={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', color: '#6B7280' }}>
                  None (Unassign)
                </MenuItem>
                {coordinators.map((coordinator) => (
                  <MenuItem
                    key={coordinator.id}
                    value={coordinator.id}
                    sx={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {coordinator.fullName || coordinator.name || coordinator.email}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleCoordinatorModalClose}
            sx={{
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCoordinator}
            disabled={!selectedCoordinator || isSavingCoordinator}
            sx={{
              backgroundColor: '#003999',
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                backgroundColor: '#002d7a',
              },
              '&:disabled': {
                backgroundColor: '#9CA3AF',
              },
            }}
          >
            {isSavingCoordinator ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CampusManagementDashboard;
