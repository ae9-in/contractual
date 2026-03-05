import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import PostProjectPage from './pages/PostProjectPage';
import FreelancerDashboardPage from './pages/FreelancerDashboardPage';
import BrowseProjectsPage from './pages/BrowseProjectsPage';
import ProfilePage from './pages/ProfilePage';
import MyProjectsPage from './pages/MyProjectsPage';
import MyWorkPage from './pages/MyWorkPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { useAuth } from './hooks/useAuth';

function AnimatedRoutes() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const roleHome = user?.role === 'business' ? '/business/dashboard' : '/freelancer/dashboard';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ width: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={isAuthenticated ? <Navigate to={roleHome} replace /> : <HomePage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={roleHome} replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={roleHome} replace /> : <RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/projects/:id" element={<ProjectDetailPage />} />

            <Route element={<RoleRoute allowedRole="business" />}>
              <Route element={<DashboardLayout />}>
                <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
                <Route path="/business/post-project" element={<PostProjectPage />} />
                <Route path="/business/projects" element={<MyProjectsPage />} />
                <Route path="/business/profile" element={<ProfilePage />} />
                <Route path="/business/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRole="freelancer" />}>
              <Route element={<DashboardLayout />}>
                <Route path="/freelancer/dashboard" element={<FreelancerDashboardPage />} />
                <Route path="/freelancer/projects" element={<BrowseProjectsPage />} />
                <Route path="/freelancer/work" element={<MyWorkPage />} />
                <Route path="/freelancer/profile" element={<ProfilePage />} />
                <Route path="/freelancer/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: 0 }}>
        <Navbar />
        <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
