export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINATOR',
  USER: 'USER',
  STUDENT: 'STUDENT',
  CUSTOMER: 'CUSTOMER',
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.COORDINATOR]: 'Coordinator',
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.STUDENT]: 'Student',
  [USER_ROLES.CUSTOMER]: 'Customer',
};

export const ROLE_COLORS = {
  [USER_ROLES.SUPER_ADMIN]: 'bg-red-100 text-red-800',
  [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
  [USER_ROLES.COORDINATOR]: 'bg-orange-100 text-orange-800',
  [USER_ROLES.USER]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.STUDENT]: 'bg-green-100 text-green-800',
  [USER_ROLES.CUSTOMER]: 'bg-indigo-100 text-indigo-800',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'manage_users',
    'manage_roles',
    'manage_books',
    'manage_events',
    'manage_orders',
    'manage_payments',
    'view_analytics',
    'system_settings',
  ],
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_books',
    'manage_events',
    'manage_orders',
    'manage_payments',
    'view_analytics',
  ],
  [USER_ROLES.COORDINATOR]: [
    'manage_events',
    'view_analytics',
    'moderate_content',
  ],
  [USER_ROLES.USER]: [
    'view_books',
    'purchase_books',
    'view_events',
  ],
  [USER_ROLES.STUDENT]: [
    'view_books',
    'view_events',
    'access_courses',
  ],
  [USER_ROLES.CUSTOMER]: [
    'view_books',
    'purchase_books',
    'view_events',
  ],
};
