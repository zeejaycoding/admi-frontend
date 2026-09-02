import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const adminItems = [
  { to: '/admin', label: 'Overview', icon: 'overview', section: 'admin' },
  { to: '/admin/national-leader', label: 'National Leader', icon: 'national-leader', section: 'admin' },
  { to: '/admin/users', label: 'Users', icon: 'users', section: 'admin' },
  { to: '/admin/campuses', label: 'Campuses', icon: 'campuses', section: 'admin' },
  { to: '/admin/campus-management', label: 'Campus Management', icon: 'campus-management', section: 'admin' },
  { to: '/admin/books', label: 'Books', icon: 'books', section: 'admin' },
  { to: '/admin/courses', label: 'Courses', icon: 'courses', section: 'admin' },
     { to: '/admin/events', label: 'Events', icon: 'events', section: 'admin' },
  { to: '/admin/powerportal', label: 'Power Portal', icon: 'portal', section: 'admin' },
   { to: '/admin/travel', label: 'Travelling Forms', icon: 'travel', section: 'admin' },
    { to: '/admin/marriage', label: 'Marriage Forms', icon: 'marriage', section: 'admin' },
     { to: '/admin/child', label: 'Child Forms', icon: 'child', section: 'admin' },
  { to: '/admin/power-bible-school', label: 'Power Bible School Registrations', icon: 'pbs-registrations', section: 'admin' },
  { to: '/admin/discipleship-program', label: 'Discipleship Program Registrations', icon: 'discipleship-registrations', section: 'admin' },
  { to: '/admin/other-programmes', label: 'Other Programme Registrations', icon: 'other-programmes', section: 'admin' },

  { to: '/admin/orders', label: 'Orders', icon: 'orders', section: 'admin' },
  { to: '/admin/payments', label: 'Payments', icon: 'payments', section: 'admin' },
  { to: '/admin/forms', label: 'Form Builder', icon: 'forms', section: 'admin' },
    { to: '/admin/reports', label: 'Reports', icon: 'reports', section: 'admin' },

  { to: '/admin/submissions', label: 'Submissions', icon: 'submissions', section: 'admin' },
  { to: '/admin/coordinator-chat', label: 'Coordinator Chat', icon: 'coordinator-chat', section: 'admin' },
  { to: '/admin/menu-management', label: 'Roles & Permissions', icon: 'menu-management', section: 'admin' },
  { to: '/', label: 'Back to site', icon: 'overview', section: 'menu' },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {drawerOpen && (
        <>
          <Sidebar
            items={adminItems}
            collapsed={false}
            variant="drawer"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <div
            className="fixed inset-0 bg-black/40 md:hidden z-40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        </>
      )}

      <Sidebar items={adminItems} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex-1 p-2 md:p-4 lg:p-6 min-w-0 overflow-hidden">
        <button
          className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white shadow mb-4"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          Menu
        </button>
        <div className="w-full max-w-none">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
