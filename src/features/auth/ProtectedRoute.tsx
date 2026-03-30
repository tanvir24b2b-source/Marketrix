import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { PermissionKey } from '@/types/domain';

export function ProtectedRoute({ children, permission }: { children: JSX.Element; permission?: PermissionKey }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return <div className="content">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/" replace />;
  return children;
}
