import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';

export default function RoleRoute({ allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader label="Loading dashboard..." />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === allowedRole ? <Outlet /> : <Navigate to="/" replace />;
}
