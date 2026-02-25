import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications } from '../../services/notificationService';
import { connectRealtime, onRealtime } from '../../services/realtimeService';

function cls({ isActive }) {
  return `top-nav-link${isActive ? ' top-nav-link-active' : ''}`;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const roleLinks = user?.role === 'business'
    ? [
        { to: '/business/dashboard', label: 'Dashboard' },
        { to: '/business/post-project', label: 'Post Project' },
        { to: '/business/projects', label: 'My Projects' },
      ]
    : [
        { to: '/freelancer/dashboard', label: 'Dashboard' },
        { to: '/freelancer/projects', label: 'Browse Projects' },
        { to: '/freelancer/work', label: 'My Work' },
      ];

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return undefined;
    }

    let active = true;
    const loadUnread = async () => {
      try {
        const { data } = await getNotifications();
        if (active) setUnreadCount(Number(data.unreadCount || 0));
      } catch {
        if (active) setUnreadCount(0);
      }
    };

    connectRealtime();
    const offCount = onRealtime('notifications:count', (payload) => {
      if (active) setUnreadCount(Number(payload?.unreadCount || 0));
    });
    const offNew = onRealtime('notifications:new', (payload) => {
      if (active) setUnreadCount(Number(payload?.unreadCount || 0));
    });

    loadUnread();
    const intervalId = setInterval(loadUnread, 60000);

    return () => {
      active = false;
      clearInterval(intervalId);
      offCount();
      offNew();
    };
  }, [isAuthenticated, location.pathname]);

  const onLogout = () => {
    logout();
    setOpen(false);
    setUnreadCount(0);
    navigate('/login');
  };

  return (
    <header className="top-header">
      <div className="brand-block">
        <span className="brand-logo">C</span>
        <div>
          <p className="brand-name">Contractual</p>
          <p className="brand-sub">Simple Contracts. Real Results.</p>
        </div>
      </div>

      <button className="menu-toggle" onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'Menu'}</button>

      <nav className={`top-nav${open ? ' top-nav-open' : ''}`}>
        {!isAuthenticated && <NavLink className={cls} to="/" onClick={() => setOpen(false)}>Home</NavLink>}
        {isAuthenticated && roleLinks.map((item) => (
          <NavLink key={item.to} className={cls} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>
        ))}
        {isAuthenticated && (
          <Link
            to={user?.role === 'business' ? '/business/notifications' : '/freelancer/notifications'}
            className="notif-bell"
            onClick={() => setOpen(false)}
            aria-label="Notifications"
            title="Notifications"
          >
            <span className="notif-bell-icon">{'\uD83D\uDD14'}</span>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>
        )}
        {!isAuthenticated && <NavLink className={cls} to="/login" onClick={() => setOpen(false)}>Login</NavLink>}
        {!isAuthenticated && <NavLink className={cls} to="/register" onClick={() => setOpen(false)}>Register</NavLink>}
        {isAuthenticated && <button className="btn btn-secondary top-logout" onClick={onLogout}>Logout</button>}
      </nav>
    </header>
  );
}
