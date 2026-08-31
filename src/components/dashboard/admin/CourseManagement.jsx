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
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  X,
} from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';
import AdminListLayout from './shared/AdminListLayout';
import {
  fetchAllCourses,
  getCourseById,
  deleteCourse,
  clearError,
  clearSuccess,
} from '../../../store/slices/courseSlice';
import { notify } from '../../../services/utils/authUtils';
import CourseCreate from '../../courses/admin/CourseCreate';
import LessonManagement from '../../courses/admin/LessonManagement';

const CourseManagement = () => {
  const dispatch = useDispatch();
  const { courses, isLoading, error } = useSelector((state) => state.course);
  const { canManage } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [lessonManagementOpen, setLessonManagementOpen] = useState(false);
  const [courseToManage, setCourseToManage] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Calculate statistics from actual course data
  const computedStats = React.useMemo(() => {
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return {
        totalCourses: 0,
        activeCourses: 0,
        totalLessons: 0,
        totalEnrollments: 0,
      };
    }

    const activeCourses = courses.filter((course) => course.isActive);
    const totalLessons = courses.reduce((sum, course) => sum + (course.lessonCount || 0), 0);
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);

    return {
      totalCourses: courses.length,
      activeCourses: activeCourses.length,
      totalLessons,
      totalEnrollments,
    };
  }, [courses]);

  // Fetch courses on component mount
  useEffect(() => {
    dispatch(fetchAllCourses({}));
  }, [dispatch]);

  // Filter courses based on search term
  useEffect(() => {
    if (!courses || !Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }

    if (searchTerm.trim()) {
      const filtered = courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
      setPage(0);
    } else {
      setFilteredCourses(courses);
    }
  }, [courses, searchTerm]);

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(fetchAllCourses({}));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await dispatch(deleteCourse(courseToDelete.id)).unwrap();
      dispatch(fetchAllCourses({}));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      notify.success(`Course "${courseToDelete.title}" deleted successfully!`);
    } catch (error) {
      notify.error('Failed to delete course. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    setEditingCourse(null);
    dispatch(fetchAllCourses({}));
  };

  const handleCloseCourseModal = () => {
    setCreateModalOpen(false);
    setEditingCourse(null);
  };

  const formatCategory = (category) => {
    if (!category) return '';
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleManageLessons = async (course) => {
    try {
      // Fetch course with lessons
      const fullCourse = await dispatch(getCourseById(course.id)).unwrap();
      setCourseToManage(fullCourse);
      setLessonManagementOpen(true);
    } catch (error) {
      notify.error('Failed to load course details. Please try again.');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCreateModalOpen(true);
  };

  const dataGridActions = [
    ...(canManage ? [{
      icon: <Edit size={18} />,
      tooltip: 'Edit Course',
      onClick: handleEditCourse,
      color: '#2563eb',
    }] : []),
    {
      icon: <GraduationCap size={18} />,
      tooltip: 'Manage Lessons',
      onClick: handleManageLessons,
      color: '#7c3aed',
    },
    ...(canManage ? [{
      icon: <Trash2 size={18} />,
      tooltip: 'Delete Course',
      onClick: handleDeleteCourse,
      color: '#dc2626',
    }] : []),
  ];

  // Paginate filtered courses client-side
  const paginatedCourses = React.useMemo(() => {
    const startIndex = page * pageSize;
    return filteredCourses.slice(startIndex, startIndex + pageSize);
  }, [filteredCourses, page, pageSize]);

  const statsGrid = (
    <Grid
      container
      spacing={{ xs: 2, sm: 2, md: 3 }}
      sx={{
        mb: { xs: 2, sm: 2.5 },
        width: '100%',
      }}
    >
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Total Courses" value={computedStats.totalCourses} icon={GraduationCap} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Active Courses" value={computedStats.activeCourses} icon={CheckCircle} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Total Lessons" value={computedStats.totalLessons} icon={BookOpen} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Total Enrollments" value={computedStats.totalEnrollments} icon={Users} color="info" />
      </Grid>
    </Grid>
  );

  const toolbar = (
    <>
      <TextField
        placeholder="Search courses by title or category..."
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

      {canManage && (
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
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
          Add Course
        </Button>
      )}

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
    </>
  );

  return (
    <AdminListLayout
      title="Course Management"
      subtitle="Manage your audio courses, lessons, and streaming content"
      stats={statsGrid}
      toolbar={toolbar}
      error={error}
      errorMessage="An error occurred while loading courses"
      extra={
        <>
          {/* Create Course Modal */}
          {createModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="relative bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={handleCloseCourseModal}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
                <CourseCreate
                  course={editingCourse}
                  onSuccess={handleCreateSuccess}
                  onCancel={handleCloseCourseModal}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Delete Course"
            message="This will permanently delete the course and all associated lessons. This action cannot be undone."
            itemName={courseToDelete?.title}
            isLoading={isLoading}
          />

          {/* Lesson Management Modal */}
          {courseToManage && (
            <LessonManagement
              isOpen={lessonManagementOpen}
              onClose={() => {
                setLessonManagementOpen(false);
                setCourseToManage(null);
                // Refresh courses to get updated lesson data
                dispatch(fetchAllCourses({}));
              }}
              course={courseToManage}
            />
          )}
        </>
      }
    >
        <DataGrid
          key={`courses-${Array.isArray(filteredCourses) ? filteredCourses.length : 0}-${searchTerm}-${page}`}
          rows={paginatedCourses}
          getRowId={(row) => row.id}
          rowCount={filteredCourses.length}
          paginationMode="client"
          columns={[
            {
              field: 'thumbnailUrl',
              headerName: 'Thumbnail',
              width: 100,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {params.value ? (
                    <Box
                      component="img"
                      src={params.value}
                      alt={params.row.title}
                      sx={{
                        width: 70,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <GraduationCap size={40} style={{ color: '#9ca3af' }} />
                  )}
                </Box>
              ),
            },
            {
              field: 'title',
              headerName: 'Title',
              flex: 1,
              minWidth: 200,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box sx={{ py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {params.value}
                  </Typography>
                </Box>
              ),
            },
            {
              field: 'category',
              headerName: 'Category',
              width: 180,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={formatCategory(params.value)}
                    size="small"
                    sx={{
                      backgroundColor: '#ede9fe',
                      color: '#7c3aed',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'lessonCount',
              headerName: 'Lessons',
              width: 100,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {params.value || 0}
                  </Typography>
                </Box>
              ),
            },
            {
              field: 'ngnPrice',
              headerName: 'NGN Price',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={`₦${params.value?.toFixed(2) || '0.00'}`}
                    size="small"
                    sx={{
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'basePrice',
              headerName: 'USD Price',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={`$${params.value?.toFixed(2) || '0.00'}`}
                    size="small"
                    sx={{
                      backgroundColor: '#dcfce7',
                      color: '#059669',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'isActive',
              headerName: 'Status',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    size="small"
                    color={params.value ? 'success' : 'error'}
                    icon={
                      params.value ? (
                        <CheckCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )
                    }
                    sx={{
                      fontSize: '0.7rem',
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
          getRowClassName={(params) => (!params.row.isActive ? 'inactive-course' : '')}
          sx={{
            height: 600,
            '& .inactive-course': {
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

export default CourseManagement;
