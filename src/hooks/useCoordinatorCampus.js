import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const hasRole = (user, roleName) => {
  if (!user) return false;
  const roles = user?.roles || user?.authorities || [];
  const list = Array.isArray(roles) ? roles : [roles];
  return list.some((r) => r === roleName || r?.name === roleName || r?.role === roleName);
};

const useCoordinatorCampus = () => {
  const { user } = useSelector((state) => state.auth);

  return useMemo(() => {
    const isCoordinator = hasRole(user, 'COORDINATOR');
    return {
      isCoordinator,
      campusName: user?.campusName || null,
    };
  }, [user]);
};

export default useCoordinatorCampus;
