import { useSelector } from 'react-redux';
import { roleBaseFor, adminPathFor } from '../utils/roleLinks';

// Reads the current authenticated user from Redux and returns
// { base, rolePath } where rolePath maps /admin/... paths to the
// role-appropriate prefix for the current user.
export const useRoleBase = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const base = roleBaseFor(currentUser?.roles || currentUser?.authorities);
  const rolePath = (adminPath) => {
    const roles = currentUser?.roles || currentUser?.authorities;
    return adminPathFor(roles, adminPath);
  };
  return { base, rolePath, currentUser };
};

export default useRoleBase;
