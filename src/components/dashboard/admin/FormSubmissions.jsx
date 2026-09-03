import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import useRoleBase from '../../../hooks/useRoleBase';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search,
  RefreshCw,
  ArrowLeft,
  Download,
  Eye,
  FileText,
  ExternalLink,
} from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import { formatDateTime } from '../../../utils/formatters';
import {
  fetchFormSubmissions,
} from '../../../store/slices/formSubmissionSlice';
import { fetchFormById } from '../../../store/slices/formSlice';
import { notify } from '../../../services/utils/authUtils';
import SubmissionDetail from './SubmissionDetail';
import ExportModal from './ExportModal';
import apiClient from '../../../services/utils/apiClient';

const FormSubmissions = ({ formId: formIdProp } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rolePath } = useRoleBase();
  const { formId: formIdParam } = useParams();
  // Reusable by an explicit form id (e.g. the Reports view) or the /forms/:formId/submissions route
  const formId = formIdProp || formIdParam;
  const { submissions, isLoading } = useSelector((state) => state.formSubmission);
  const { selectedForm } = useSelector((state) => state.form);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Load form details and submissions on mount
  useEffect(() => {
    if (formId) {
      dispatch(fetchFormById(formId));
    }
  }, [dispatch, formId]);

  useEffect(() => {
    if (formId) {
      loadSubmissions();
    }
  }, [formId]);

  const loadSubmissions = async () => {
    if (!formId) return;

    try {
      await dispatch(fetchFormSubmissions({
        formId: formId,
        params: {
          page: 0,
          size: 1000, // Load all for client-side pagination
        }
      })).unwrap();
    } catch (error) {
      notify.error('Failed to load submissions: ' + (error.message || error));
    }
  };

  // Filter submissions based on search term
  useEffect(() => {
    const submissionList = submissions?.content || [];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = submissionList.filter((submission) => {
        // Check userName and userEmail
        if (submission.userName?.toLowerCase().includes(searchLower)) return true;
        if (submission.userEmail?.toLowerCase().includes(searchLower)) return true;

        // Also check submissionData for email and name
        const data = submission.submissionData || {};
        if (data.Email?.toLowerCase().includes(searchLower)) return true;
        if (data.email?.toLowerCase().includes(searchLower)) return true;
        if (data['First Name']?.toLowerCase().includes(searchLower)) return true;
        if (data['Last Name']?.toLowerCase().includes(searchLower)) return true;
        if (data.firstName?.toLowerCase().includes(searchLower)) return true;
        if (data.lastName?.toLowerCase().includes(searchLower)) return true;

        return false;
      });
      setFilteredSubmissions(filtered);
      setPage(0);
    } else {
      setFilteredSubmissions(submissionList);
    }
  }, [submissions, searchTerm]);

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    loadSubmissions();
  };

  const handleExportCSV = () => {
    setExportModalOpen(true);
  };

  const handleExport = async (exportData) => {
    setIsExporting(true);
    try {
      const { dateFrom, dateTo, format } = exportData;

      // Prepare filename
      const formTitle = selectedForm?.title || 'form';
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `${formTitle}-submissions-${timestamp}.${extension}`;

      // Call API
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      params.format = format;

      const response = await apiClient.get(
        `/form-submissions/admin/form/${formId}/export`,
        {
          params,
          responseType: 'blob',
        }
      );

      // Download file
      const blob = new Blob([response.data], {
        type: format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify.success(`Submissions exported successfully as ${format.toUpperCase()}`);
      setExportModalOpen(false);
    } catch (error) {
      notify.error('Failed to export submissions: ' + (error.message || error));
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedSubmission(null);
  };

  // Helper function to extract files from submission data
  const getFilesFromSubmission = (submissionData) => {
    if (!submissionData) return [];

    const files = [];
    const pushFile = (key, value) => {
      if (value && typeof value === 'object' && value.fileUrl) {
        files.push({
          fieldName: key,
          fileName: value.fileName,
          fileUrl: value.fileUrl,
          fileSize: value.fileSize,
          contentType: value.contentType,
        });
      }
    };
    Object.entries(submissionData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Multi-file field (e.g. receipts): an array of file objects
        value.forEach((item) => pushFile(key, item));
      } else {
        pushFile(key, value);
      }
    });
    return files;
  };

  const handleDownloadFile = async (s3Key, fileName, forceDownload = true) => {
    try {
      // Get presigned URL from secure backend endpoint
      const response = await apiClient.get('/form-submissions/admin/file/download', {
        params: {
          s3Key: s3Key,
          expirationHours: 1,
        },
      });

      if (response.data?.presignedUrl) {
        if (forceDownload) {
          // Force download by fetching as blob
          const fileResponse = await fetch(response.data.presignedUrl);
          const blob = await fileResponse.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL
          window.URL.revokeObjectURL(blobUrl);
        } else {
          // Just view in new tab
          window.open(response.data.presignedUrl, '_blank');
        }
      } else {
        notify.error('Failed to generate download URL');
      }
    } catch (error) {
      notify.error('Failed to download file');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const dataGridActions = [
    {
      icon: <Eye size={18} />,
      tooltip: 'View Details',
      onClick: handleViewDetails,
      color: '#003999',
    },
  ];

  // Paginate filtered submissions client-side
  const paginatedSubmissions = React.useMemo(() => {
    const startIndex = page * pageSize;
    return filteredSubmissions.slice(startIndex, startIndex + pageSize);
  }, [filteredSubmissions, page, pageSize]);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'left' }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#1f2937"
          gutterBottom
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            lineHeight: 1.2,
          }}
        >
          {selectedForm?.title || 'Form'} - Submissions
        </Typography>
        <Typography
          variant="body1"
          color="#6b7280"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          View and manage form submissions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        sx={{
          mb: { xs: 2, sm: 2.5 },
          width: '100%',
        }}
      >
        <Grid item xs={12} sm={6}>
          <StatsCard title="Total Submissions" value={filteredSubmissions.length} icon={FileText} color="primary" />
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          p: 2,
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
          }}
        >
          <TextField
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            size="small"
          />

          <Button
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate(rolePath('/admin/forms'))}
            size="small"
            sx={{
              backgroundColor: '#6b7280',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#4b5563',
              },
            }}
          >
            Back to Forms
          </Button>

          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={handleExportCSV}
            size="small"
            sx={{
              backgroundColor: '#059669',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#047857',
              },
            }}
          >
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} />}
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
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Submissions DataGrid */}
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <DataGrid
          key={`submissions-${filteredSubmissions.length}-${searchTerm}-${page}`}
          rows={paginatedSubmissions}
          getRowId={(row) => row.id}
          rowCount={filteredSubmissions.length}
          paginationMode="client"
          columns={[
            {
              field: 'id',
              headerName: 'ID',
              width: 80,
            },
            {
              field: 'userName',
              headerName: 'Submitted By',
              flex: 1,
              minWidth: 150,
              renderCell: (params) => {
                const data = params.row.submissionData || {};

                // Prioritize submissionData first (form fields)
                const firstName = data['First Name'] || data.firstName || '';
                const lastName = data['Last Name'] || data.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim();

                // Fall back to userName (authenticated user) if no name in form
                if (fullName) return fullName;
                if (params.row.userName) return params.row.userName;

                return 'Anonymous';
              },
            },
            {
              field: 'userEmail',
              headerName: 'Email',
              flex: 1,
              minWidth: 200,
              renderCell: (params) => {
                const data = params.row.submissionData || {};

                // Prioritize submissionData first (form fields)
                const formEmail = data.Email || data.email;
                if (formEmail) return formEmail;

                // Fall back to userEmail (authenticated user) if no email in form
                if (params.row.userEmail) return params.row.userEmail;

                return 'N/A';
              },
            },
            {
              field: 'files',
              headerName: 'Files',
              width: 220,
              renderCell: (params) => {
                const files = getFilesFromSubmission(params.row.submissionData);
                if (files.length === 0) {
                  return <span className="text-gray-400 text-xs">No files</span>;
                }
                return (
                  <div className="flex items-center gap-1 flex-wrap">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file.fileUrl, file.fileName, false);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
                          title="View file"
                        >
                          <ExternalLink size={12} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file.fileUrl, file.fileName, true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium transition-colors"
                          title="Download file"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                );
              },
            },
            {
              field: 'submittedAt',
              headerName: 'Submitted At',
              flex: 1,
              minWidth: 180,
              renderCell: (params) => formatDateTime(params.value),
            },
          ]}
          actions={dataGridActions}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetail
          open={detailModalOpen}
          onClose={handleDetailModalClose}
          submission={selectedSubmission}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </Box>
  );
};

export default FormSubmissions;
