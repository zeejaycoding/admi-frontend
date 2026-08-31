import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Presentational shell shared by the admin "*Management" list screens.
 *
 * It renders ONLY the pieces that are byte-for-byte identical across those
 * screens — the page wrapper, the header (title/subtitle), the search/toolbar
 * Paper, the error Paper, and the DataGrid Paper wrapper — while every
 * screen-specific concern (stats cards, the toolbar contents, the DataGrid
 * itself, and any modals) is passed in as a slot so behaviour and rendered
 * output stay exactly the same.
 *
 * Props:
 *  - title, subtitle: header text.
 *  - headerAction: optional node. When provided, the header switches to the
 *    flex row layout (title/subtitle on the left, action on the right) used by
 *    UserManagement. When omitted, the plain left-aligned header is rendered.
 *  - stats: node rendered between the header and the toolbar (the stats grid).
 *  - toolbar: node rendered inside the search/actions Paper's flex row. Omit to
 *    skip the toolbar Paper entirely.
 *  - error, errorMessage: when `error` is truthy, the error Paper is shown with
 *    `error.message` (falling back to `errorMessage`, or a string `error`).
 *  - children: the DataGrid (wrapped in the standard elevation-2 Paper).
 *  - tableWrapper: set false to render `children` without the Paper wrapper
 *    (used when a screen needs custom content, e.g. tabs, inside the Paper).
 *  - extra: node rendered after the table (modals, etc.).
 */
const AdminListLayout = ({
  title,
  subtitle,
  headerAction = null,
  stats = null,
  toolbar = null,
  error = null,
  errorMessage = 'An error occurred',
  children,
  tableWrapper = true,
  extra = null,
}) => {
  const resolvedErrorMessage =
    (error && (typeof error === 'string' ? error : error.message)) || errorMessage;

  const table = tableWrapper ? (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: 'white',
      }}
    >
      {children}
    </Paper>
  ) : (
    children
  );

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
      {headerAction ? (
        <Box
          sx={{
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#1f2937"
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }, lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              color="#6b7280"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {subtitle}
            </Typography>
          </Box>
          {headerAction}
        </Box>
      ) : (
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
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="#6b7280"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      )}

      {/* Statistics */}
      {stats}

      {/* Search and Actions */}
      {toolbar && (
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
            {toolbar}
          </Box>
        </Paper>
      )}

      {/* Error Display */}
      {error && (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            backgroundColor: '#fee2e2',
            border: '1px solid #dc2626',
            borderRadius: 2,
            width: '100%',
          }}
        >
          <Typography
            color="#dc2626"
            sx={{
              p: 2,
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            Error: {resolvedErrorMessage}
          </Typography>
        </Paper>
      )}

      {/* Table */}
      {table}

      {/* Modals / extra content */}
      {extra}
    </Box>
  );
};

export default AdminListLayout;
