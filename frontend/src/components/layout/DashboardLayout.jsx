import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <button className="sidebar-toggle" onClick={() => setOpen((v) => !v)}>Menu</button>
      <Sidebar role={user?.role} open={open} onClose={() => setOpen(false)} />
      <main className="dashboard-main page-enter">
        <Outlet />
      </main>
    </div>
  );
}
