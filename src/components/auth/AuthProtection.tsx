
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';
import { hasPermission } from '@/utils/adminPermissions';

interface AuthProtectionProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthProtection = ({ children, allowedRoles = [] }: AuthProtectionProps) => {
  const { user } = useAuth();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission (admin always has permission)
  if (hasPermission(user.role, allowedRoles)) {
    return <>{children}</>;
  }

  // If user doesn't have required role, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default AuthProtection;
