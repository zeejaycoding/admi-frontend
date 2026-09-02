import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, ShoppingBag, CreditCard,
  BarChart3, GraduationCap, MapPin, WrenchIcon, LogOut, Home, Calendar, Building2, Plane,
  Baby, FileText, Shield,
  HeartHandshake,
  MessagesSquare,
  Globe,
  Church,
  School,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import admiLogo from '../../assets/logo-admi.png';
import useAuth from '../../hooks/useAuth';

const iconMap = {
  overview: LayoutDashboard,
  users: Users,
  books: BookOpen,
  campuses: MapPin,
  orders: ShoppingBag,
  payments: CreditCard,
  reports: BarChart3,
  events: Calendar,
  courses: GraduationCap,
  forms: WrenchIcon,
  submissions: FileText,
  'menu-management': Shield,
  portal: Building2,
  travel: Plane,
  child: Baby,
  marriage: HeartHandshake,
  'coordinator-chat': MessagesSquare,
  'national-leader': Globe,
  'campus-management': School,
  'pbs-registrations': Church,
  'discipleship-registrations': Church,
  'other-programmes': Church,
};

const PERMISSION_TO_ICON = {
  MENU_OVERVIEW:    'overview',
  MENU_USERS:       'users',
  MENU_CAMPUSES:    'campuses',
  MENU_BOOKS:       'books',
  MENU_COURSES:     'courses',
  MENU_ORDERS:      'orders',
  MENU_PAYMENTS:    'payments',
  MENU_FORMS:       'forms',
  MENU_SUBMISSIONS: 'submissions',
  MENU_REPORTS:     'reports',
  MENU_EVENTS:      'events',
  MENU_MANAGEMENT:  'menu-management',
};

const Sidebar = ({ items = [], collapsed = false, onToggle, variant = 'persistent', open = false, onClose }) => {
  const { logout } = useAuth();
  const { user: currentUser } = useSelector((state) => state.auth);

  const userPermissions = new Set(currentUser?.permissions || []);

  const userRoles = currentUser?.roles || currentUser?.authorities || [];
  const roleList = Array.isArray(userRoles) ? userRoles : [userRoles];
  const isCoordinator = roleList.some((r) => r === 'COORDINATOR' || r?.name === 'COORDINATOR' || r?.role === 'COORDINATOR');
  const isNationalLeader = roleList.some((r) => r === 'NATIONAL_LEADER' || r?.name === 'NATIONAL_LEADER' || r?.role === 'NATIONAL_LEADER');

  const allowedItems = new Set(['overview']);
  Object.entries(PERMISSION_TO_ICON).forEach(([permKey, iconKey]) => {
    if (userPermissions.has(permKey)) allowedItems.add(iconKey);
  });

  const COORDINATOR_ICONS = new Set([
    'travel',
    'marriage',
    'child',
    'portal',
    'reports',
    'coordinator-chat',
  ]);

  const visibleAdminItems = items
    .filter((i) => i.section === 'admin')
    .filter((i) => {
      if (isCoordinator) {
        return COORDINATOR_ICONS.has(i.icon);
      }
      if (i.icon === 'coordinator-chat') return isCoordinator;
      if (i.icon === 'national-leader') return isNationalLeader;
      return !Object.values(PERMISSION_TO_ICON).includes(i.icon) || allowedItems.has(i.icon);
    });

  const isDrawer = variant === 'drawer';
  const containerBase = 'flex flex-col text-white shadow-2xl';
  const persistentClasses = `hidden md:flex h-screen sticky top-0 transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`;
  const drawerClasses = `fixed inset-y-0 left-0 md:hidden w-64 transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} z-50`;

  const handleItemClick = () => {
    if (isDrawer && onClose) onClose();
  };

  const showLabel = !collapsed || isDrawer;

  return (
    <aside
      className={`${containerBase} ${isDrawer ? drawerClasses : persistentClasses}`}
      style={{ background: 'linear-gradient(180deg, #002166 0%, #001552 50%, #000a3d 100%)' }}
    >
      <div className="px-3 pt-5 pb-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={admiLogo}
            alt="ADMI"
            className={`flex-shrink-0 object-contain ${collapsed && !isDrawer ? 'h-8 w-8' : 'h-10 w-auto max-w-[100px]'}`}
          />
          {showLabel && (
            <div className="min-w-0">
              <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">Admin Portal</p>
            </div>
          )}
        </div>

        {!isDrawer ? (
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeWidth="2" d="M9 19l7-7-7-7"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {showLabel && (
          <p className="text-white/40 text-[10px] uppercase tracking-widest px-2 mb-2">Admin</p>
        )}
        <nav className="space-y-0.5">
          {visibleAdminItems.map((it) => {
            const Icon = iconMap[it.icon] || LayoutDashboard;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  } ${collapsed && !isDrawer ? 'justify-center' : ''}`
                }
                onClick={handleItemClick}
                title={collapsed && !isDrawer ? it.label : undefined}
              >
                <Icon size={17} className="flex-shrink-0" />
                {showLabel && <span>{it.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="px-2 py-3 border-t border-white/10 space-y-0.5">
        {items
          .filter((i) => i.section === 'menu')
          .map((it) => {
            const Icon = iconMap[it.icon] || Home;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/8 hover:text-white transition-all text-sm font-medium"
                onClick={handleItemClick}
                title={collapsed && !isDrawer ? it.label : undefined}
              >
                <Home size={17} className="flex-shrink-0" />
                {showLabel && <span>{it.label}</span>}
              </NavLink>
            );
          })}

        <button
          onClick={() => { logout(); if (isDrawer && onClose) onClose(); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium ${collapsed && !isDrawer ? 'justify-center' : ''}`}
          title={collapsed && !isDrawer ? 'Log out' : undefined}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {showLabel && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
