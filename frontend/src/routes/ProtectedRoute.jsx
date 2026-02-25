import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader label="Checking session..." />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
