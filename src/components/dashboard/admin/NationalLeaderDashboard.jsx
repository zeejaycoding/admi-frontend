import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Users, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
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
} from 'recharts';
import { useSelector } from 'react-redux';
import campusService from '../../../services/api/campusService';
import travelFormService from '../../../services/api/travelFormService';
import childDedicationService from '../../../services/api/childDedicationService';
import marriageCertificateService from '../../../services/api/marriageCertificateService';
import reportService from '../../../services/api/reportService';

const strip = (arr) =>
  arr == null
    ? []
    : Array.isArray(arr)
    ? arr
    : Array.isArray(arr?.campuses)
    ? arr.campuses
    : Array.isArray(arr?.content)
    ? arr.content
    : Array.isArray(arr?.data)
    ? arr.data
    : Array.isArray(arr?.data?.campuses)
    ? arr.data.campuses
    : Array.isArray(arr?.data?.data)
    ? arr.data.data
    : [];

const formatTimeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const NationalLeaderDashboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Campus
  const [campusStats, setCampusStats] = useState(null);
  const [campuses, setCampuses] = useState([]);

  // Power portal aggregates (region-scoped by backend for NATIONAL_LEADER)
  const [portalStats, setPortalStats] = useState(null);

  // Form lists (region-scoped by backend)
  const [travelForms, setTravelForms] = useState([]);
  const [childDedications, setChildDedications] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [reports, setReports] = useState([]);

  const region = currentUser?.region;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        // [campusStats, campusList]
        Promise.all([
          campusService.getCampusStats().then((r) => r?.data?.data || r?.data || null),
          campusService.getManagementList({ size: 100 }).then((r) => strip(r?.data)),
        ]),
        travelFormService.getStats().then((r) => r?.data?.data || r?.data || null),
        travelFormService.getAll().then((r) => strip(r?.data)),
        childDedicationService.getAll().then((r) => strip(r?.data)),
        marriageCertificateService.getAll().then((r) => strip(r?.data)),
        reportService.getAllReports().then((r) => strip(r?.data)),
      ]);

      const campusResult = results[0].status === 'fulfilled' ? results[0].value : [null, []];
      setCampusStats(campusResult[0] || null);
      setCampuses(campusResult[1] || []);
      setPortalStats(results[1].status === 'fulfilled' ? results[1].value : null);
      setTravelForms(results[2].status === 'fulfilled' ? results[2].value : []);
      setChildDedications(results[3].status === 'fulfilled' ? results[3].value : []);
      setMarriages(results[4].status === 'fulfilled' ? results[4].value : []);
      setReports(results[5].status === 'fulfilled' ? results[5].value : []);
      setLastUpdated(new Date());
    } catch (err) {
      // keep previous data on transient failures
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, [loadAll]);

  // ---- Derived stat cards ----
  const totalCampuses = campusStats?.totalCampuses ?? campuses.length ?? 0;
  const totalRecords =
    (portalStats?.travelForms?.total ?? travelForms.length) +
    (portalStats?.childDedications?.total ?? childDedications.length) +
    (portalStats?.marriageCertificates?.total ?? marriages.length) +
    reports.length;

  const pendingCount =
    (portalStats?.travelForms?.pending ?? 0) +
    (portalStats?.childDedications?.pending ?? 0) +
    (portalStats?.marriageCertificates?.pending ?? 0) +
    reports.filter((r) => !r?.status || String(r?.status).toLowerCase() === 'pending').length;

  const totalRegistrations = totalRecords;

  const statCards = [
    {
      title: 'Total Campus Count',
      value: totalCampuses,
      subtitle: region ? `Campuses in ${region}` : 'Campuses in region',
      bgColor: 'bg-[#E5ECFF]',
      icon: Calendar,
      iconColor: '#3163EC',
    },
    {
      title: 'Total Records',
      value: totalRecords,
      subtitle: 'Travel, Child, Marriage & Reports',
      bgColor: 'bg-[#F0FDF4]',
      icon: Users,
      iconColor: '#07FF53',
    },
    {
      title: 'Total Registrations',
      value: totalRegistrations,
      subtitle: `Across ${totalCampuses} campus(es)`,
      bgColor: 'bg-[#FEFBE8]',
      icon: Clock,
      iconColor: '#EACB06',
    },
    {
      title: 'Pending Approvals',
      value: pendingCount,
      subtitle: 'Require your attention',
      bgColor: 'bg-[#FEF3F1]',
      icon: AlertTriangle,
      iconColor: '#F74949',
    },
  ];

  // ---- Programme registrations by type ----
  const barData = [
    { name: 'Travel Forms', value: portalStats?.travelForms?.total ?? travelForms.length, fill: '#33CFFF' },
    { name: 'Child', value: portalStats?.childDedications?.total ?? childDedications.length, fill: '#40C4AA' },
    { name: 'Marriages', value: portalStats?.marriageCertificates?.total ?? marriages.length, fill: '#EEEFF2' },
    { name: 'Reports', value: reports.length, fill: '#FFD6A8' },
  ];
  const maxBar = Math.max(1, ...barData.map((d) => d.value));

  // ---- Pending approvals ----
  const pendingApprovals = [];
  travelForms
    .filter((f) => String(f?.status || '').toLowerCase() === 'pending')
    .slice(0, 3)
    .forEach((f) =>
      pendingApprovals.push({
        id: `tf-${f.id}`,
        name: `Travel Form - ${f.submitterName || 'Submission'}`,
        location: f.campus || '—',
        submitted: formatTimeAgo(f.submittedAt || f.submitted) || '—',
      })
    );
  childDedications
    .filter((c) => String(c?.status || '').toLowerCase() === 'pending')
    .slice(0, 3)
    .forEach((c) =>
      pendingApprovals.push({
        id: `cd-${c.id}`,
        name: `Child Dedication - ${c.childName || 'Submission'}`,
        location: c.campus || '—',
        submitted: formatTimeAgo(c.submittedAt || c.submitted) || '—',
      })
    );
  marriages
    .filter((m) => String(m?.status || '').toLowerCase() === 'pending')
    .slice(0, 3)
    .forEach((m) =>
      pendingApprovals.push({
        id: `mc-${m.id}`,
        name: `Marriage - ${m.groomName || 'Submission'}`,
        location: m.campus || '—',
        submitted: formatTimeAgo(m.submittedAt || m.submitted) || '—',
      })
    );
  reports
    .filter((r) => !r?.status || String(r?.status).toLowerCase() === 'pending')
    .slice(0, 3)
    .forEach((r) =>
      pendingApprovals.push({
        id: `rep-${r.id}`,
        name: `Report - ${r.country || r.campus || 'Report'}`,
        location: r.campus || '—',
        submitted: formatTimeAgo(r.createdAt || r.updatedAt) || '—',
      })
    );
  pendingApprovals.sort((a, b) => (a.submitted || '').localeCompare(b.submitted || ''));

  // ---- Recent activity (merged, newest first) ----
  const recentActivities = [];
  travelForms.slice(0, 5).forEach((f) =>
    recentActivities.push({
      id: `tf-${f.id}`,
      name: `Travel form ${f.status || 'submitted'}`,
      time: formatTimeAgo(f.submittedAt || f.submitted),
      location: f.campus || '—',
      ts: new Date(f.submittedAt || f.submitted || 0).getTime(),
    })
  );
  childDedications.slice(0, 5).forEach((c) =>
    recentActivities.push({
      id: `cd-${c.id}`,
      name: `Child dedication ${c.status || 'submitted'}`,
      time: formatTimeAgo(c.submittedAt || c.submitted),
      location: c.campus || '—',
      ts: new Date(c.submittedAt || c.submitted || 0).getTime(),
    })
  );
  marriages.slice(0, 5).forEach((m) =>
    recentActivities.push({
      id: `mc-${m.id}`,
      name: `Marriage certificate ${m.status || 'submitted'}`,
      time: formatTimeAgo(m.submittedAt || m.submitted),
      location: m.campus || '—',
      ts: new Date(m.submittedAt || m.submitted || 0).getTime(),
    })
  );
  reports.slice(0, 5).forEach((r) =>
    recentActivities.push({
      id: `rep-${r.id}`,
      name: `Financial report recorded`,
      time: formatTimeAgo(r.createdAt || r.updatedAt),
      location: r.campus || r.country || '—',
      ts: new Date(r.createdAt || r.updatedAt || 0).getTime(),
    })
  );
  recentActivities.sort((a, b) => b.ts - a.ts);
  const recentActivityTop = recentActivities.slice(0, 8);

  // ---- Upcoming events (region campuses as placeholders) ----
  const upcomingEvents = campuses.slice(0, 8).map((c, i) => ({
    id: c.id ?? i,
    name: `${c.name || `Campus ${i + 1}`}`,
    date: c.region || '—',
  }));

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="text-black font-bold"
            style={{ fontSize: '24px', fontFamily: 'Inter, sans-serif' }}
          >
            National Leader Regional Dashboard
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              color: '#474C59',
            }}
            className="mt-1"
          >
            {region
              ? `Consolidated live view of all activities for ${region}`
              : 'Consolidated live view of all activities in your region'}
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E5E7EB] text-sm font-medium text-[#0A0A0A] hover:bg-gray-100 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
          {lastUpdated && (
            <span className="text-xs text-[#6A7282] ml-1">
              {lastUpdated.toLocaleTimeString('en-US')}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`${card.bgColor} rounded-lg p-5 flex flex-col gap-3 min-h-[160px]`}
              >
                <p
                  className="text-[#0A0A0A]"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  {card.title}
                </p>

                <div className="flex items-center gap-4">
                  <Icon size={28} color={card.iconColor} strokeWidth={2} />
                  <p
                    className="text-[#0A0A0A]"
                    style={{
                      fontSize: '32px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {card.value}
                  </p>
                </div>

                <p
                  className="text-[#717182] mt-auto"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  {card.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="col-span-3 bg-white rounded-xl p-6 shadow-sm">
          <h2
            className="text-[#0D0D12]"
            style={{
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            Records by Type
          </h2>
          <p
            className="text-[#0D0D1294] mb-6"
            style={{
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
            }}
          >
            Live counts from travel, child, marriage and reports
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
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
                domain={[0, maxBar]}
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

        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm min-h-[420px]">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full bg-[#FFF7ED] border border-[#FFD6A8] flex items-center justify-center"
              style={{ flexShrink: 0 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF6900"
                strokeWidth={2}
                className="w-5 h-5 text-[#FF6900]"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1">
              <p
                className="text-[#0A0A0A]"
                style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Pending Approvals
              </p>
              <p
                className="text-[#717182] mt-1"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Forms awaiting your action
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {pendingApprovals.length === 0 ? (
              <p className="text-[#717182] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                No pending approvals. All caught up!
              </p>
            ) : (
              pendingApprovals.slice(0, 8).map((approval) => (
                <div
                  key={approval.id}
                  className="p-3 bg-[#FFF7ED] border border-[#FFD6A8] rounded-lg"
                >
                  <p
                    className="text-[#0A0A0A]"
                    style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                  >
                    {approval.name}
                  </p>
                  <p
                    className="text-[#717182] mt-1"
                    style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                  >
                    {approval.location} • {approval.submitted}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full bg-[#E5ECFF] flex items-center justify-center"
              style={{ flexShrink: 0 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#155DFC"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex-1">
              <p
                className="text-[#0A0A0A]"
                style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Campuses in Region
              </p>
              <p
                className="text-[#717182] mt-1"
                style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Campuses within your assigned region
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {campuses.length === 0 ? (
              <p className="text-[#717182] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                No campuses found in this region.
              </p>
            ) : (
              campuses.slice(0, 10).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-lg"
                >
                  <div>
                    <p
                      className="text-[#0A0A0A]"
                      style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      {c.name}
                    </p>
                    <p
                      className="text-[#6A7282] text-xs mt-0.5"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {c.city || c.fullAddress || c.region || '—'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                      c.isActive === false
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {c.coordinator || 'No coordinator'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="relative" style={{ flexShrink: 0 }}>
              <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full" />
            </div>
            <div className="flex-1">
              <p
                className="text-[#0A0A0A]"
                style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Recent Activity Log
              </p>
              <p
                className="text-[#717182] mt-1"
                style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Latest submissions across your region
              </p>
            </div>
          </div>

          <div className="space-y-0 max-h-[300px] overflow-y-auto pr-1">
            {recentActivityTop.length === 0 ? (
              <p className="text-[#717182] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                No recent activity yet.
              </p>
            ) : (
              recentActivityTop.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2B7FFF] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[#0A0A0A]"
                          style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                        >
                          {activity.name}
                        </p>
                        <p
                          className="text-[#6A7282]"
                          style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                        >
                          {activity.time || '—'}
                        </p>
                      </div>
                      <p
                        className="text-[#4A5565] mt-0.5"
                        style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        {activity.location}
                      </p>
                    </div>
                  </div>
                  {index < recentActivityTop.length - 1 && (
                    <div className="border-b border-[#E5E7EB]" />
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalLeaderDashboard;
