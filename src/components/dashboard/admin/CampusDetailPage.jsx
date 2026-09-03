import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoleBase from '../../../hooks/useRoleBase';
import { useDispatch, useSelector } from 'react-redux';
import {
  Download,
  Building2,
  MapPin,
  Users,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Globe,
  User,
  RefreshCw,
} from 'lucide-react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '../../ui';
import { notify } from '../../../services/utils/authUtils';
import {
  getCampusById,
  clearCurrentCampus,
  updateCampus,
} from '../../../store/slices/campusSlice';
import userService from '../../../services/api/userService';
import campusService from '../../../services/api/campusService';

const CampusDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rolePath } = useRoleBase();
  const dispatch = useDispatch();
  const { currentCampus, isLoading, error } = useSelector(
    (state) => state.campus
  );
  const [isExporting, setIsExporting] = useState(false);
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [coordinators, setCoordinators] = useState([]);
  const [isLoadingCoordinators, setIsLoadingCoordinators] = useState(false);
  const [isAssigningCoordinator, setIsAssigningCoordinator] = useState(false);
  const [growthView, setGrowthView] = useState('weekly');
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalytics = useCallback(async () => {
    if (!id) return;
    setIsLoadingAnalytics(true);
    try {
      const res = await campusService.getCampusAnalytics(id);
      const data = res?.data?.analytics || res?.data?.data || res?.data || {};
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      // keep the previous data on transient polling failures
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 15000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const handleManualRefresh = async () => {
    if (id) {
      dispatch(getCampusById(id));
    }
    await loadAnalytics();
    notify.success('Data refreshed');
  };

  useEffect(() => {
    if (id) {
      dispatch(getCampusById(id));
    }
    return () => {
      dispatch(clearCurrentCampus());
    };
  }, [dispatch, id]);

  const campus = currentCampus;

  const getCampusLocation = () => {
    if (!campus) return '';
    if (campus.fullAddress) return campus.fullAddress;
    return [campus.city, campus.region, campus.country].filter(Boolean).join(', ');
  };

  const getCampusStatus = () => {
    if (!campus) return 'active';
    if (campus.status) return campus.status;
    if (campus.isActive === true) return 'active';
    if (campus.isActive === false) return 'inactive';
    return 'active';
  };

  const getCoordinatorName = () => {
    if (!campus) return 'Unassigned';
    if (campus.coordinatorName) return campus.coordinatorName;
    if (campus.coordinator) return campus.coordinator;
    if (campus.coordinatorFullName) return campus.coordinatorFullName;
    return 'Unassigned';
  };

  const getCoordinatorRole = () => {
    if (!campus) return '';
    return campus.coordinatorRole || 'Coordinator';
  };

  const getCoordinatorEmail = () => {
    if (!campus) return '';
    return campus.coordinatorEmail || campus.email || '';
  };

  const getCoordinatorPhone = () => {
    if (!campus) return '';
    return campus.coordinatorPhone || campus.phoneNumber || '';
  };

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
      const coordinatorsOnly = allUsers.filter(hasCoordinatorRole);
      setCoordinators(coordinatorsOnly);
      return coordinatorsOnly;
    } catch (err) {
      notify.error('Failed to load coordinators');
      return [];
    } finally {
      setIsLoadingCoordinators(false);
    }
  }, []);

  const handleOpenCoordinatorModal = async () => {
    setCoordinatorModalOpen(true);
    const list = await fetchCoordinators();
    const currentEmail = campus?.coordinatorEmail;
    const currentName = campus?.coordinator;
    const match =
      list.find(
        (c) => currentEmail && c.email && String(c.email).toLowerCase() === String(currentEmail).toLowerCase()
      ) ||
      list.find(
        (c) => currentName && c.fullName && String(c.fullName).toLowerCase() === String(currentName).toLowerCase()
      );
    setSelectedCoordinator(match ? String(match.id) : '');
  };

  const handleCoordinatorModalClose = () => {
    setCoordinatorModalOpen(false);
    setSelectedCoordinator('');
  };

  const defaultRegistrations = [
    { name: 'Child Dedications', value: 0, fill: '#33CFFF' },
    { name: 'Marriages', value: 0, fill: '#40C4AA' },
    { name: 'Travel Forms', value: 0, fill: '#EEEFF2' },
    { name: 'Reports', value: 0, fill: '#FFD6A8' },
  ];

  const barData =
    analytics?.registrationsByType && analytics.registrationsByType.length
      ? analytics.registrationsByType.map((r) => ({
          name: r.name,
          value: r.count || 0,
          fill: r.color,
        }))
      : defaultRegistrations;

  const weeklyGrowthData = (analytics?.weeklyActivity || []).map((a) => ({
    day: a.name,
    members: a.count || 0,
  }));

  const monthlyGrowthData = (analytics?.monthlyActivity || []).map((a) => ({
    month: a.name,
    members: a.count || 0,
  }));

  const formatTimestamp = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString('en-US');
  };

  const recentActivities = (analytics?.recentActivity || []).map((a) => ({
    id: a.id,
    activity: a.activity,
    date: formatTimestamp(a.date),
  }));

  const handleSaveCoordinator = async () => {
    if (!campus || !selectedCoordinator) return;

    const coordinator = coordinators.find(
      (c) => String(c.id) === String(selectedCoordinator),
    );
    if (!coordinator) {
      notify.error('Selected coordinator not found');
      return;
    }

    setIsAssigningCoordinator(true);
    try {
      await dispatch(
        updateCampus({
          id: campus.id,
          campusData: {
            coordinator: coordinator.fullName || coordinator.name || coordinator.email,
            coordinatorEmail: coordinator.email,
          },
        })
      ).unwrap();

      notify.success('Coordinator updated successfully!');
      dispatch(getCampusById(id));
      loadAnalytics();
      handleCoordinatorModalClose();
    } catch (err) {
      notify.error(err.message || 'Failed to update coordinator');
    } finally {
      setIsAssigningCoordinator(false);
    }
  };

  const handleExportPDF = () => {
    if (!campus) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(1, 26, 90);
      doc.text(campus.name || 'Campus Detail', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        body: [
          ['Campus Name', campus.name || 'N/A'],
          ['Status', getCampusStatus().charAt(0).toUpperCase() + getCampusStatus().slice(1)],
          ['Location', getCampusLocation() || 'N/A'],
          ['Coordinator', getCoordinatorName()],
          ['Total Records', String(analytics?.totals?.totalRecords ?? 0)],
          ['Phone', campus.phoneNumber || 'N/A'],
          ['Email', campus.email || 'N/A'],
          ['Region', campus.region || 'N/A'],
          ['Currency', campus.currency || 'N/A'],
          ['Created', campus.createdAt ? new Date(campus.createdAt).toLocaleDateString() : 'N/A'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [1, 26, 90] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
        },
      });

      doc.save(`Campus-${(campus.name || 'detail').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      notify.success('Campus details exported to PDF.');
    } catch (err) {
      notify.error('PDF export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!campus) return;
    setIsExporting(true);
    try {
      const headers = ['Field', 'Value'];
      const rows = [
        ['Campus Name', campus.name || 'N/A'],
        ['Status', getCampusStatus()],
        ['Location', getCampusLocation() || 'N/A'],
        ['Coordinator', getCoordinatorName()],
        ['Total Records', String(analytics?.totals?.totalRecords ?? 0)],
        ['Phone', campus.phoneNumber || 'N/A'],
        ['Email', campus.email || 'N/A'],
        ['Region', campus.region || 'N/A'],
        ['Currency', campus.currency || 'N/A'],
        ['Created', campus.createdAt || 'N/A'],
      ];

      const escape = (v) => {
        const str = v == null ? '' : String(v);
        return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Campus-${(campus.name || 'detail').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success('Campus details exported to CSV.');
    } catch (err) {
      notify.error('CSV export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const statusColorMap = {
    active: { bg: '#DCFCE7', color: '#00A63E' },
    under_review: { bg: '#FFF7ED', color: '#F54900' },
    inactive: { bg: '#F3F4F6', color: '#4A5565' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <CircularProgress size={48} sx={{ color: '#003999' }} />
      </div>
    );
  }

  if (error || !campus) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Campus not found or an error occurred.
          </p>
          <Button
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate(rolePath('/admin/campus-management'))}
            sx={{
              backgroundColor: '#003999',
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Back to Campus Management
          </Button>
        </div>
      </div>
    );
  }

  const status = getCampusStatus();
  const statusLabel = status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
            onClick={() => navigate(rolePath('/admin/campus-management'))}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} color="#6B7280" />
            </button>
            <h1
              className="text-black font-bold"
              style={{ fontSize: '24px', fontFamily: 'Inter, sans-serif' }}
            >
              {campus.name}
            </h1>
          </div>
          <p
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              color: '#474C59',
            }}
            className="ml-11"
          >
            Comprehensive campus profile with detailed metrics
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-3">
          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} color="#504F4F" />}
            onClick={handleManualRefresh}
            disabled={isLoadingAnalytics}
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
            disabled={isExporting}
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
            disabled={isExporting}
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
          <p
            className="text-xs text-[#6A7282]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString('en-US')}`
              : isLoadingAnalytics
                ? 'Fetching live data...'
                : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              style={{ flexShrink: 0 }}
            >
              <Building2 size={20} color="#0A0A0A" />
            </div>
            <h2
              className="text-[#0A0A0A]"
              style={{
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              Campus Information
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-[#6A7282]"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Campus Name
                </p>
                <p
                  className="text-[#0A0A0A] mt-1"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {campus.name}
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: '#0A0A0A',
                }}
              >
                <span
                  className="text-white"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div>
              <p
                className="text-[#6A7282]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Location
              </p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={18} color="#99A1AF" />
                <p
                  className="text-[#0A0A0A]"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {getCampusLocation() || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p
                className="text-[#6A7282]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Total Records
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Users size={18} color="#2B7FFF" />
                <p
                  className="text-[#0A0A0A]"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {analytics?.totals?.totalRecords ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                style={{ flexShrink: 0 }}
              >
                <User size={20} color="#0A0A0A" />
              </div>
              <h2
                className="text-[#0A0A0A]"
                style={{
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Campus Coordinator
              </h2>
            </div>
            <Button
              variant="contained"
              onClick={handleOpenCoordinatorModal}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#0A0A0A',
                border: '1px solid #0000001A',
                boxShadow: 'none',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                  boxShadow: 'none',
                },
              }}
            >
              Update Coordinator
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <p
                className="text-[#6A7282]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Name
              </p>
              <p
                className="text-[#0A0A0A] mt-1"
                style={{
                  fontSize: '18px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  color: getCoordinatorName() === 'Unassigned' ? '#F54900' : '#0A0A0A',
                }}
              >
                {getCoordinatorName()}
              </p>
            </div>

            <div>
              <p
                className="text-[#6A7282]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Role
              </p>
              <p
                className="text-[#0A0A0A] mt-1"
                style={{
                  fontSize: '18px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                {getCoordinatorRole() || 'N/A'}
              </p>
            </div>

            <div>
              <p
                className="text-[#6A7282]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Email
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Mail size={18} color="#99A1AF" />
                <p
                  className="text-[#0A0A0A]"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {getCoordinatorEmail() || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p
                className="text-[#6A7282]"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Phone
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Phone size={18} color="#99A1AF" />
                <p
                  className="text-[#0A0A0A]"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {getCoordinatorPhone() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2
            className="text-[#0D0D12] mb-1"
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            Programme Registrations by Type
          </h2>
          <p
            className="text-[#0D0D1294] mb-6"
            style={{
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
            }}
          >
            Count by programme category
          </p>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666D80', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666D80', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <Tooltip
                formatter={(value) => [value, 'Records']}
                contentStyle={{
                  borderRadius: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v) => `${v}`}
                  style={{ fill: '#0D0D12', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2
              className="text-[#0D0D12]"
              style={{
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              Campus Growth
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGrowthView('weekly')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  growthView === 'weekly'
                    ? 'bg-[#003999] text-white'
                    : 'bg-gray-100 text-[#6A7282] hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Weekly
              </button>
              <button
                onClick={() => setGrowthView('monthly')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  growthView === 'monthly'
                    ? 'bg-[#003999] text-white'
                    : 'bg-gray-100 text-[#6A7282] hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Monthly
              </button>
            </div>
          </div>
          <p
            className="text-[#6A7282] mb-6"
            style={{
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
            }}
          >
            Campus activity over time
          </p>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={growthView === 'weekly' ? weeklyGrowthData : monthlyGrowthData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000000" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#000000" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#73B1FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#73B1FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey={growthView === 'weekly' ? 'day' : 'month'}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666D80', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666D80', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="members"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-full bg-[#E5ECFF] flex items-center justify-center"
            style={{ flexShrink: 0 }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#155DFC"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2
            className="text-[#0A0A0A]"
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            Recent Activity
          </h2>
        </div>
        <p
          className="text-[#717182] mb-6 ml-11"
          style={{
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
          }}
        >
          Latest updates and changes
        </p>

        <div className="space-y-0">
          {recentActivities.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="flex items-start gap-3 py-4">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-[#2B7FFF] flex-shrink-0 mt-1.5"
                />
                <div className="flex-1">
                  <p
                    className="text-[#0A0A0A]"
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {item.activity}
                  </p>
                  <p
                    className="text-[#6A7282] mt-0.5"
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    {item.date}
                  </p>
                </div>
              </div>
              {index < recentActivities.length - 1 && (
                <div className="border-b border-[#0000001A]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

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
          Update Coordinator
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
              {campus.name} — {getCampusLocation()}
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
            disabled={!selectedCoordinator || isAssigningCoordinator}
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
            {isAssigningCoordinator ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CampusDetailPage;
