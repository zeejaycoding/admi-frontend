import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tab,
  Tabs,
  IconButton,
} from '@mui/material';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
import { Download, Search, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '../../ui';
import { notify } from '../../../services/utils/authUtils';
import userService from '../../../services/api/userService';
import usePermissions from '../../../hooks/usePermissions';

const LEADER_LIKE_ROLES = new Set([
  'COORDINATOR',
  'NATIONAL_LEADER',
  'ADMIN',
  'SUPER_ADMIN',
  'ZONAL_LEADER',
  'PASTOR',
  'LEADER',
]);

const unwrap = (res) => {
  const data = res?.data?.data ?? res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (data?.content) return data.content;
  return data?.users || data?.records || [];
};

const PersonnelAndLeaderManagement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Review details modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  // Tag modal
  const [tagOpen, setTagOpen] = useState(false);
  const [tagTarget, setTagTarget] = useState(null);
  const [tagReason, setTagReason] = useState('');
  const [savingTag, setSavingTag] = useState(false);

  // Admin review drawer
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [reviewPerson, setReviewPerson] = useState(null);
  const [records, setRecords] = useState({ travelForms: [], childDedications: [], marriageCertificates: [], reports: [] });
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [subTab, setSubTab] = useState(0);
  const [showTaggedOnly, setShowTaggedOnly] = useState(false);

  const { isAdmin } = usePermissions();

  const computeRoleLabel = (user) => {
    const roles = user?.roles || user?.authorities || [];
    const list = Array.isArray(roles) ? roles : [roles];
    if (list.length === 0) return 'Personnel';
    if (list.includes('COORDINATOR')) return 'Campus Coordinator';
    if (list.includes('NATIONAL_LEADER')) return 'National Leader';
    if (list.includes('SUPER_ADMIN')) return 'Super Admin';
    if (list.includes('ADMIN')) return 'Admin';
    return list[0].charAt(0).toUpperCase() + String(list[0]).slice(1).toLowerCase();
  };

  const buildRow = (u, index) => {
    const roles = (Array.isArray(u?.roles) ? u.roles : [u?.roles]).filter(Boolean);
    const isLeaderLike =
      roles.length === 0 ||
      roles.some((r) => LEADER_LIKE_ROLES.has(String(r).toUpperCase()));
    if (!isLeaderLike) return null;

    const flagged = Boolean(u?.flaggedForReview);
    const status = flagged
      ? 'Tagged'
      : u?.isActive === false
      ? 'Inactive'
      : 'Active';

    return {
      id: u.id,
      fullName: u.fullName || u?.name || '—',
      memberId: `ADM-${String(u.id ?? index + 1).padStart(4, '0')}`,
      role: computeRoleLabel(u),
      roleKeys: roles.map((r) => String(r).toUpperCase()),
      campus: u?.campusName || u?.campus || u?.region || '—',
      appointment: u?.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US') : '—',
      status,
      isActive: u?.isActive !== false,
      flagged,
      reviewReason: u?.reviewTagReason || '',
      reviewTaggedAt: u?.reviewTaggedAt || null,
      email: u?.email || '',
    };
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({ size: 500, sortBy: 'createdAt', sortDirection: 'desc' });
      const users = unwrap(res);
      setRows(users.map(buildRow).filter(Boolean));
    } catch (err) {
      notify.error('Failed to load personnel records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => {
    const total = rows.length;
    const coordinators = rows.filter((r) => r.roleKeys.includes('COORDINATOR')).length;
    const otherLeaders = rows.filter(
      (r) =>
        r.roleKeys.some((k) => k !== 'COORDINATOR' && LEADER_LIKE_ROLES.has(k)) &&
        !r.roleKeys.includes('COORDINATOR'),
    ).length;
    const tagged = rows.filter((r) => r.flagged).length;
    return { total, coordinators, otherLeaders, tagged };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      if (showTaggedOnly && !r.flagged) return false;
      if (!term) return true;
      return [r.fullName, r.memberId, r.role, r.campus, r.status, r.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [rows, searchTerm, showTaggedOnly]);

  const handleExportPDF = () => {
    if (filteredRows.length === 0) {
      notify.error('No personnel records to export.');
      return;
    }
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.setTextColor(1, 26, 90);
      doc.text('Personnel & Leader Management Report', 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, 14, 23);
      autoTable(doc, {
        startY: 30,
        head: [
          ['Full Name', 'Member ID', 'Role', 'Campus', 'Date of Appointment', 'Status'],
        ],
        body: filteredRows.map((r) => [
          r.fullName,
          r.memberId,
          r.role,
          r.campus,
          r.appointment,
          r.status,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [1, 26, 90] },
        styles: { fontSize: 8 },
      });
      doc.save(`Personnel-Leaders-${new Date().toISOString().split('T')[0]}.pdf`);
      notify.success('Personnel data exported to PDF.');
    } catch (err) {
      notify.error('PDF export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      notify.error('No personnel records to export.');
      return;
    }
    setIsExporting(true);
    try {
      const headers = ['Full Name', 'Member ID', 'Role', 'Campus', 'Date of Appointment', 'Status'];
      const escape = (v) => {
        const str = v == null ? '' : String(v);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const rowsCsv = filteredRows.map((r) =>
        [r.fullName, r.memberId, r.role, r.campus, r.appointment, r.status].map(escape).join(','),
      );
      const csv = [headers.join(','), ...rowsCsv].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Personnel-Leaders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success('Personnel data exported to CSV.');
    } catch (err) {
      notify.error('CSV export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const openReview = (row) => {
    setReviewTarget(row);
    setReviewOpen(true);
  };

  const openTag = (row) => {
    setTagTarget(row);
    setTagReason(row.flagged ? row.reviewReason || '' : '');
    setTagOpen(true);
  };

  const closeTag = () => {
    setTagOpen(false);
    setTagTarget(null);
    setTagReason('');
  };

  const handleTag = async () => {
    if (!tagTarget) return;
    if (!tagReason.trim()) {
      notify.error('Please provide a reason for tagging.');
      return;
    }
    setSavingTag(true);
    try {
      await userService.tagForReview(tagTarget.id, tagReason.trim());
      notify.success('Personnel record tagged for Admin review.');
      setTagOpen(false);
      setTagTarget(null);
      setTagReason('');
      loadUsers();
    } catch (err) {
      notify.error('Failed to tag the record.');
    } finally {
      setSavingTag(false);
    }
  };

  const loadRecords = useCallback(async (person) => {
    if (!person) return;
    setRecordsLoading(true);
    try {
      const res = await userService.getPersonnelRecords(person.id);
      const data = res?.data?.data ?? res?.data ?? res ?? {};
      setRecords({
        travelForms: data.travelForms || [],
        childDedications: data.childDedications || [],
        marriageCertificates: data.marriageCertificates || [],
        reports: data.reports || [],
      });
    } catch (err) {
      notify.error('Failed to load personnel records.');
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  const openReviewDrawer = (row) => {
    setReviewPerson(row);
    setSubTab(0);
    setRecords({ travelForms: [], childDedications: [], marriageCertificates: [], reports: [] });
    setReviewDrawerOpen(true);
    loadRecords(row);
  };

  const closeReviewDrawer = () => {
    setReviewDrawerOpen(false);
    setReviewPerson(null);
  };

  const handleUntag = async () => {
    if (!reviewPerson) return;
    setRecordsLoading(true);
    try {
      await userService.clearReviewTag(reviewPerson.id);
      notify.success('Personnel record untagged.');
      setReviewDrawerOpen(false);
      setReviewPerson(null);
      loadUsers();
    } catch (err) {
      notify.error('Failed to clear the review tag.');
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleKeepTag = () => {
    notify.success('Personnel record kept tagged for review.');
    setReviewDrawerOpen(false);
    setReviewPerson(null);
  };

  const REVIEW_TABS = [
    { key: 'travel', label: 'Travel', data: records.travelForms },
    { key: 'child', label: 'Child', data: records.childDedications },
    { key: 'marriage', label: 'Marriage', data: records.marriageCertificates },
    { key: 'report', label: 'Reports', data: records.reports },
  ];

  const statCards = [
    { title: 'Total Personnel', value: stats.total, color: '#0A0A0A' },
    { title: 'Campus Coordinators', value: stats.coordinators, color: '#155DFC' },
    { title: 'Other Leaders', value: stats.otherLeaders, color: '#00A63E' },
    { title: 'Tagged for Review', value: stats.tagged, color: '#F54900' },
  ];

  const columns = [
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1.3,
      minWidth: 200,
      disableColumnMenu: true,
      renderCell: (params) => (
        <span
          style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}
        >
          {params.row.fullName}
        </span>
      ),
    },
    {
      field: 'memberId',
      headerName: 'Member ID',
      width: 140,
      disableColumnMenu: true,
      renderCell: (params) => (
        <span style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}>{params.row.memberId}</span>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Chip
          label={params.row.role}
          size="small"
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '6px',
            backgroundColor: params.row.role === 'Campus Coordinator' ? '#EAF1FF' : '#F3F4F6',
            color: params.row.role === 'Campus Coordinator' ? '#155DFC' : '#0A0A0A',
          }}
        />
      ),
    },
    {
      field: 'campus',
      headerName: 'Campus',
      flex: 1,
      minWidth: 160,
      disableColumnMenu: true,
      renderCell: (params) => (
        <span style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}>{params.row.campus}</span>
      ),
    },
    {
      field: 'appointment',
      headerName: 'Date of Appointment',
      width: 180,
      disableColumnMenu: true,
      renderCell: (params) => (
        <span style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}>{params.row.appointment}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      disableColumnMenu: true,
      renderCell: (params) => {
        const color =
          params.row.status === 'Tagged'
            ? '#F54900'
            : params.row.status === 'Active'
            ? '#00A63E'
            : '#4A5565';
        const bg =
          params.row.status === 'Tagged'
            ? '#FFF1E8'
            : params.row.status === 'Active'
            ? '#E8F7EF'
            : '#F3F4F6';
        return (
          <Chip
            label={params.row.status}
            size="small"
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              backgroundColor: bg,
              color,
            }}
          />
        );
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1.2,
      minWidth: 320,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <Button
            variant="contained"
            onClick={() =>
              isAdmin && params.row.flagged
                ? openReviewDrawer(params.row)
                : openReview(params.row)
            }
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#111827',
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: '20px',
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              minWidth: '96px',
              px: 2,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: '#F3F4F6' },
            }}
          >
            Review
          </Button>
          <Button
            variant="contained"
            onClick={() => openTag(params.row)}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#111827',
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: '20px',
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              minWidth: '96px',
              px: 2,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: '#F3F4F6' },
            }}
          >
            {params.row.flagged ? 'Tagged' : 'Tag'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-black font-bold"
            style={{ fontSize: '24px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
          >
            Personnel & Leader Management
          </h1>
          <p
            style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', color: '#474C59' }}
            className="mt-1"
          >
            View and manage leaders and key personnel across campuses in your region
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="contained"
            startIcon={<Download size={18} color="#504F4F" />}
            onClick={handleExportPDF}
            disabled={isExporting || loading}
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
              '&:hover': { backgroundColor: '#F3F4F6' },
            }}
          >
            Export as PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} color="#FFFFFF" />}
            onClick={handleExportCSV}
            disabled={isExporting || loading}
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
              '&:hover': { backgroundColor: '#011A5A' },
            }}
          >
            Export as CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-black/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg p-5 border border-[#0000001A]">
              <p
                className="text-[#0A0A0A]"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
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
                {loading ? <CircularProgress size={20} /> : stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <Button
            variant={showTaggedOnly ? 'contained' : 'outlined'}
            onClick={() => setShowTaggedOnly((v) => !v)}
            sx={{
              backgroundColor: showTaggedOnly ? '#F54900' : '#FFFFFF',
              color: showTaggedOnly ? '#FFFFFF' : '#374151',
              borderColor: '#E5E7EB',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              minHeight: '40px',
              px: 3,
              '&:hover': { backgroundColor: showTaggedOnly ? '#E04300' : '#F9FAFB' },
            }}
          >
            Tagged for Review ({stats.tagged})
          </Button>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl shadow-sm" style={{ width: '100%' }}>
        {loading && rows.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ color: '#003999' }} />
          </Box>
        ) : (
          <MuiDataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            loading={loading}
            sx={{
              border: 'none',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                minHeight: '44px',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 700,
                fontSize: '13px',
                color: '#374151',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                overflow: 'visible',
                whiteSpace: 'normal',
                lineHeight: 1.3,
              },
              '& .MuiDataGrid-row': { maxHeight: 'none' },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F9FAFB' },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #E5E7EB',
                minHeight: '44px',
              },
            }}
          />
        )}
      </div>

      {/* Review details modal */}
      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)' } }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            color: '#0A0A0A',
            pb: 1,
          }}
        >
          Personnel Details
        </DialogTitle>
        <DialogContent dividers={false} sx={{ pt: '4px !important' }}>
          <p
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', color: '#717182', marginBottom: '20px' }}
          >
            Full information for Leader {reviewTarget?.fullName || ''}
          </p>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#6A7282' }}>Full Name</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginTop: 2 }}>{reviewTarget?.fullName || '—'}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#6A7282' }}>Member ID</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginTop: 2 }}>{reviewTarget?.memberId || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#6A7282' }}>Role</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginTop: 2 }}>{reviewTarget?.role || '—'}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#6A7282' }}>Campus</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginTop: 2 }}>{reviewTarget?.campus || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#6A7282' }}>Date of Appointment</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginTop: 2 }}>{reviewTarget?.appointment || '—'}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#6A7282' }}>Status</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginTop: 2 }}>{reviewTarget?.status || '—'}</p>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setReviewOpen(false)}
            sx={{
              backgroundColor: '#011A5A',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              px: 3,
              py: 1,
              '&:hover': { backgroundColor: '#011A5A' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag for review modal */}
      <Dialog
        open={tagOpen}
        onClose={closeTag}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)' } }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            color: '#0A0A0A',
            pb: 1,
          }}
        >
          Tag for Admin Review
        </DialogTitle>
        <DialogContent sx={{ pt: '4px !important' }}>
          <p
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', color: '#717182', marginBottom: '20px' }}
          >
            Flag this personnel record for Admin attention
          </p>
          <p
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0A0A0A', marginBottom: '8px' }}
          >
            Reason for Tagging
          </p>
          <TextField
            multiline
            minRows={5}
            fullWidth
            value={tagReason}
            onChange={(e) => setTagReason(e.target.value)}
            placeholder="Explain why this record needs Admin review..."
            variant="outlined"
            InputProps={{
              sx: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#717182',
                backgroundColor: '#F3F3F5',
                borderRadius: '10px',
                '& fieldset': { borderColor: '#00000000' },
                '&:hover fieldset': { borderColor: '#00000000' },
                '&.Mui-focused fieldset': { borderColor: '#011A5A' },
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            gap: 2,
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            onClick={closeTag}
            sx={{
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              minWidth: '100px',
              minHeight: '40px',
              px: 3,
              '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F9FAFB' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTag}
            disabled={savingTag || !tagReason.trim()}
            sx={{
              backgroundColor: '#F54900',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              minWidth: '140px',
              minHeight: '40px',
              px: 3,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: '#E04300' },
              '&.Mui-disabled': {
                backgroundColor: '#FCA5A5',
                color: '#FFFFFF',
              },
            }}
          >
            {savingTag ? 'Tagging...' : 'Tag for Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin review drawer */}
      <Dialog
        open={reviewDrawerOpen}
        onClose={closeReviewDrawer}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            pb: 1,
            pt: 3,
            px: 3,
          }}
        >
          <div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}>
              {reviewPerson?.fullName || 'Personnel Review'}
            </div>
            <div style={{ fontSize: '14px', color: '#717182', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
              {reviewPerson?.memberId || ''} · {reviewPerson?.role || ''}
            </div>
          </div>
          <IconButton onClick={closeReviewDrawer} sx={{ color: '#6B7280' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          {/* Profile summary */}
          <Box
            sx={{
              border: '1px solid #EEF0F4',
              borderRadius: '12px',
              p: 2.5,
              mb: 3,
              backgroundColor: '#FAFAFB',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
              Profile
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#6A7282', fontFamily: 'Inter, sans-serif' }}>Role</div>
                <div style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{reviewPerson?.role || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#6A7282', fontFamily: 'Inter, sans-serif' }}>Campus</div>
                <div style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{reviewPerson?.campus || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#6A7282', fontFamily: 'Inter, sans-serif' }}>Date of Appointment</div>
                <div style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{reviewPerson?.appointment || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#6A7282', fontFamily: 'Inter, sans-serif' }}>Status</div>
                <div style={{ fontSize: '14px', color: reviewPerson?.flagged ? '#F54900' : '#0A0A0A', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                  {reviewPerson?.status || '—'}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#6A7282', fontFamily: 'Inter, sans-serif' }}>Reason for Tagging</div>
                <div style={{ fontSize: '14px', color: '#0A0A0A', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                  {reviewPerson?.reviewReason || '—'}
                </div>
              </div>
            </div>
          </Box>

          {/* Submissions */}
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
            Submissions
          </div>
          <Tabs
            value={subTab}
            onChange={(_, v) => setSubTab(v)}
            sx={{
              '& .MuiTab-root': {
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                minHeight: '44px',
              },
              '& .Mui-selected': { color: '#011A5A' },
              '& .MuiTabs-indicator': { backgroundColor: '#011A5A' },
            }}
          >
            {REVIEW_TABS.map((t) => (
              <Tab key={t.key} label={`${t.label} (${t.data.length})`} />
            ))}
          </Tabs>

          <Box sx={{ mt: 2, mb: 1, border: '1px solid #EEF0F4', borderRadius: '10px', minHeight: 180 }}>
            {recordsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={30} sx={{ color: '#003999' }} />
              </Box>
            ) : REVIEW_TABS[subTab].data.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                No {REVIEW_TABS[subTab].label.toLowerCase()} submissions found.
              </Box>
            ) : (
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                {REVIEW_TABS[subTab].data.map((item) => (
                  <Box
                    key={`${item.type}-${item.id}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2.5,
                      py: 2,
                      borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}>
                        {item.title || '—'}
                      </div>
                      {item.subtitle ? (
                        <div style={{ fontSize: '13px', color: '#6A7282', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                          {item.subtitle}
                        </div>
                      ) : null}
                    </div>
                    <Chip
                      label={item.status || '—'}
                      size="small"
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: '6px',
                        backgroundColor: item.status === 'Approved' ? '#E8F7EF' : item.status === 'Pending' ? '#FFF7E6' : '#F3F4F6',
                        color: item.status === 'Approved' ? '#00A63E' : item.status === 'Pending' ? '#B7791F' : '#4A5565',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            gap: 2,
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleKeepTag}
            sx={{
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              minWidth: '120px',
              minHeight: '40px',
              px: 3,
              '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F9FAFB' },
            }}
          >
            Keep Tagged
          </Button>
          <Button
            variant="contained"
            onClick={handleUntag}
            disabled={recordsLoading}
            sx={{
              backgroundColor: '#F54900',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '8px',
              minWidth: '120px',
              minHeight: '40px',
              px: 3,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: '#E04300' },
            }}
          >
            Untag & Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PersonnelAndLeaderManagement;
