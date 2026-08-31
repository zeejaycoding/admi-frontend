import React from 'react';
import { Calendar, Users, Clock, AlertTriangle } from 'lucide-react';
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

const statCards = [
  {
    title: 'Total Campus Count',
    value: '24',
    subtitle: 'Campuses in region',
    bgColor: 'bg-[#E5ECFF]',
    icon: Calendar,
    iconColor: '#3163EC',
  },
  {
    title: 'Total Members',
    value: '1,847',
    subtitle: 'Aggregate across all campuses',
    bgColor: 'bg-[#F0FDF4]',
    icon: Users,
    iconColor: '#07FF53',
  },
  {
    title: 'Programme Registration',
    value: '312',
    subtitle: 'Active registrations',
    bgColor: 'bg-[#FEFBE8]',
    icon: Clock,
    iconColor: '#EACB06',
  },
  {
    title: 'Pending approvals',
    value: '18',
    subtitle: 'Require urgent attention',
    bgColor: 'bg-[#FEF3F1]',
    icon: AlertTriangle,
    iconColor: '#F74949',
  },
];

const barData = [
  { name: 'Discipleship', value: 78, fill: '#5F57FF' },
  { name: 'PBS', value: 62, fill: '#33CFFF' },
  { name: 'Youth', value: 91, fill: '#40C4AA' },
  { name: 'Women', value: 35, fill: '#EEEFF2' },
  { name: 'Leadership', value: 54, fill: '#FFD6A8' },
];

const pendingApprovals = [
  {
    id: 1,
    name: 'Discipleship Registration - John Doe',
    location: 'Lagos Campus',
    submitted: '2 hours ago',
  },
  {
    id: 2,
    name: 'PBS Form Submission - Sarah Smith',
    location: 'Abuja Campus',
    submitted: '5 hours ago',
  },
  {
    id: 3,
    name: 'Youth Programme - Michael Brown',
    location: 'Port Harcourt Campus',
    submitted: '1 day ago',
  },
  {
    id: 4,
    name: 'Women\'s Conference - Emily Davis',
    location: 'Ibadan Campus',
    submitted: '1 day ago',
  },
  {
    id: 5,
    name: 'Leadership Training - David Wilson',
    location: 'Enugu Campus',
    submitted: '2 days ago',
  },
];

const upcomingEvents = [
  {
    id: 1,
    name: 'Regional Leadership Conference',
    date: 'Mar 15, 2026',
  },
  {
    id: 2,
    name: 'Youth Empowerment Summit',
    date: 'Mar 22, 2026',
  },
  {
    id: 3,
    name: 'Women\'s Prayer Breakfast',
    date: 'Apr 5, 2026',
  },
  {
    id: 4,
    name: 'Discipleship Training Workshop',
    date: 'Apr 12, 2026',
  },
  {
    id: 5,
    name: 'PBS Graduation Ceremony',
    date: 'Apr 20, 2026',
  },
];

const recentActivities = [
  {
    id: 1,
    name: 'New registration submitted',
    time: '10 min ago',
    location: 'Lagos Campus',
  },
  {
    id: 2,
    name: 'Form approved by coordinator',
    time: '25 min ago',
    location: 'Abuja Campus',
  },
  {
    id: 3,
    name: 'Event attendance updated',
    time: '1 hour ago',
    location: 'Port Harcourt Campus',
  },
  {
    id: 4,
    name: 'New member added to PBS',
    time: '2 hours ago',
    location: 'Ibadan Campus',
  },
  {
    id: 5,
    name: 'Discipleship form completed',
    time: '3 hours ago',
    location: 'Enugu Campus',
  },
];

const CustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#0D0D12"
      textAnchor="middle"
      style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
    >
      {value}%
    </text>
  );
};

const NationalLeaderDashboard = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6 lg:p-8">
      <div className="mb-6">
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
          Consolidated view of all activities, key metrics, and management tools
          for your region
        </p>
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

          <ResponsiveContainer width="100%" height={300}>
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
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Registrations']}
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
                <LabelList content={<CustomBarLabel />} dataKey="value" />
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
                Forms or requests awaiting National Leader action
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {pendingApprovals.map((approval) => (
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
            ))}
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
                Upcoming Events
              </p>
              <p
                className="text-[#717182] mt-1"
                style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Events scheduled within the region
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-lg"
              >
                <p
                  className="text-[#0A0A0A]"
                  style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  {event.name}
                </p>
                <span
                  className="px-3 py-1 bg-[#ECEEF2] rounded-full text-[#0A0A0A]"
                  style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {event.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="relative" style={{ flexShrink: 0 }}>
              <div
                className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center"
              >
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
                Latest form submissions, registrations, changes
              </p>
            </div>
          </div>

          <div className="space-y-0 max-h-[300px] overflow-y-auto pr-1">
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <div className="flex items-start gap-3 py-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-[#2B7FFF] mt-1.5 flex-shrink-0"
                  />
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
                        {activity.time}
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
                {index < recentActivities.length - 1 && (
                  <div className="border-b border-[#E5E7EB]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalLeaderDashboard;
