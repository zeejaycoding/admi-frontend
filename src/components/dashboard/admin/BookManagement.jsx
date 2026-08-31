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
  BookOpen,
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  X,
} from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';
import AdminListLayout from './shared/AdminListLayout';
import {
  fetchAllBooks,
  deleteBook,
  clearError,
  clearSuccess,
} from '../../../store/slices/bookSlice';
import { notify } from '../../../services/utils/authUtils';
import BookCreate from '../../books/admin/BookCreate';

const BookManagement = () => {
  const dispatch = useDispatch();
  const { books, isLoading, error } = useSelector((state) => state.book);
  const { canManage } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Calculate statistics from actual book data
  const computedStats = React.useMemo(() => {
    if (!books || !Array.isArray(books) || books.length === 0) {
      return {
        totalBooks: 0,
        activeBooks: 0,
        ngnValue: 0,
        usdValue: 0,
      };
    }

    const activeBooks = books.filter((book) => book.isActive);
    const ngnValue = books.reduce((sum, book) => sum + (book.ngnPrice || 0), 0);
    const usdValue = books.reduce((sum, book) => sum + (book.basePrice || 0), 0);

    return {
      totalBooks: books.length,
      activeBooks: activeBooks.length,
      ngnValue: ngnValue.toFixed(2),
      usdValue: usdValue.toFixed(2),
    };
  }, [books]);

  // Fetch books on component mount
  useEffect(() => {
    dispatch(fetchAllBooks({ size: 1000 }));
  }, [dispatch]);

  // Filter books based on search term
  useEffect(() => {
    if (!books || !Array.isArray(books)) {
      setFilteredBooks([]);
      return;
    }

    if (searchTerm.trim()) {
      const filtered = books.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.publisher?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
      setPage(0);
    } else {
      setFilteredBooks(books);
    }
  }, [books, searchTerm]);

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(fetchAllBooks({ size: 1000 }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleDeleteBook = (book) => {
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      await dispatch(deleteBook(bookToDelete.id)).unwrap();
      dispatch(fetchAllBooks({ size: 1000 }));
      setDeleteModalOpen(false);
      setBookToDelete(null);
      notify.success(`Book "${bookToDelete.title}" deleted successfully!`);
    } catch (error) {
      notify.error('Failed to delete book. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setBookToDelete(null);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    dispatch(fetchAllBooks({ size: 1000 }));
  };

  const dataGridActions = canManage ? [
    {
      icon: <Trash2 size={18} />,
      tooltip: 'Delete Book',
      onClick: handleDeleteBook,
      color: '#dc2626',
    },
  ] : [];

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
        <StatsCard title="Total Books" value={computedStats.totalBooks} icon={BookOpen} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Active Books" value={computedStats.activeBooks} icon={CheckCircle} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="NGN Value" value={`₦${computedStats.ngnValue}`} icon={DollarSign} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="USD Value" value={`$${computedStats.usdValue}`} icon={DollarSign} color="warning" />
      </Grid>
    </Grid>
  );

  const toolbar = (
    <>
      <TextField
        placeholder="Search books by title..."
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
          Add Book
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
      title="Book Management"
      subtitle="Manage your church eBook catalog, uploads, and pricing"
      stats={statsGrid}
      toolbar={toolbar}
      error={error}
      errorMessage="An error occurred while loading books"
      extra={
        <>
          {/* Create Book Modal - Using your campus pattern */}
          {createModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="relative bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
                <BookCreate onSuccess={handleCreateSuccess} onCancel={() => setCreateModalOpen(false)} />
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Delete Book"
            message="This will permanently delete the book and all associated data. This action cannot be undone."
            itemName={bookToDelete?.title}
            isLoading={isLoading}
          />
        </>
      }
    >
        <DataGrid
          key={`books-${Array.isArray(filteredBooks) ? filteredBooks.length : 0}-${searchTerm}`}
          rows={filteredBooks}
          getRowId={(row) => row.id}
          paginationMode="client"
          columns={[
            {
              field: 'coverImageUrl',
              headerName: 'Cover',
              width: 80,
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
                        width: 40,
                        height: 55,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <BookOpen size={40} style={{ color: '#9ca3af' }} />
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
              field: 'language',
              headerName: 'Language',
              width: 100,
              headerAlign: 'center',
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
          getRowClassName={(params) => (!params.row.isActive ? 'inactive-book' : '')}
          sx={{
            height: 600,
            '& .inactive-book': {
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

export default BookManagement;
