// Shared helper to compute role-appropriate URL prefixes.
//
// Underlying admin pages are shared across ADMIN, COORDINATOR and
// NATIONAL_LEADER, but each role gets its own URL base:
//   admins      -> /admin/*
//   coordinators -> /coordinator/*
//   national leaders -> /national-leader/*
//
// Pass the currently authenticated user's `roles`/`authorities` array (or the
// full user object) to resolve the base for that user.

const hasRole = (roles, roleName) =>
  (Array.isArray(roles) ? roles : roles ? [roles] : [])
    .some((r) => r === roleName || r?.name === roleName || r?.role === roleName);

export const roleBaseFor = (userOrRoles) => {
  const roles = userOrRoles && typeof userOrRoles === 'object' && !Array.isArray(userOrRoles)
    ? userOrRoles.roles || userOrRoles.authorities
    : userOrRoles;
  if (hasRole(roles, 'NATIONAL_LEADER')) return '/national-leader';
  if (hasRole(roles, 'COORDINATOR')) return '/coordinator';
  return '/admin';
};

// Map an /admin/... path to the role-appropriate prefix for the given user.
export const adminPathFor = (userOrRoles, adminPath) => {
  const base = roleBaseFor(userOrRoles);
  if (!adminPath || typeof adminPath !== 'string') return base;
  return adminPath.startsWith('/admin') ? base + adminPath.slice('/admin'.length) : adminPath;
};
