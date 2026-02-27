import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout" style={{ display: 'block' }}>
      <main className="dashboard-main page-enter" style={{ width: '100%', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
