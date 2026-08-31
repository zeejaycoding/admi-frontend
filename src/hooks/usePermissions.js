import { useSelector } from 'react-redux';

const usePermissions = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const userRoles = new Set(
    (currentUser?.roles || []).map((r) => (typeof r === 'string' ? r : r.name))
  );
  const permissions = new Set(currentUser?.permissions || []);

  const isSuperAdmin = userRoles.has('SUPER_ADMIN');
  const isAdmin = isSuperAdmin || userRoles.has('ADMIN');
  const hasPermission = (permKey) => permissions.has(permKey);
  const canManage = isAdmin;

  return { isSuperAdmin, isAdmin, hasPermission, canManage, permissions, userRoles };
};

export default usePermissions;
