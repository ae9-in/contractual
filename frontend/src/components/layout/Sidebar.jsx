import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function linkClass({ isActive }) {
  return `side-link${isActive ? ' side-link-active' : ''}`;
}

export default function Sidebar({ role, open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const items = role === 'business'
    ? [
      { to: '/business/dashboard', label: 'Dashboard' },
      { to: '/business/post-project', label: 'Post Project' },
      { to: '/business/projects', label: 'My Projects' },
      { to: '/business/profile', label: 'Profile' },
      { to: '/business/notifications', label: 'Notifications' },
    ]
    : [
      { to: '/freelancer/dashboard', label: 'Dashboard' },
      { to: '/freelancer/projects', label: 'Browse Projects' },
      { to: '/freelancer/work', label: 'My Work' },
      { to: '/freelancer/profile', label: 'Profile' },
      { to: '/freelancer/notifications', label: 'Notifications' },
    ];

  const onLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <div className="sidebar-head">
        <p className="sidebar-title">{role === 'business' ? 'Business' : 'Freelancer'}</p>
        <button className="sidebar-close" onClick={onClose}>Close</button>
      </div>
      <div className="sidebar-links">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
            {item.label}
          </NavLink>
        ))}
      </div>
      <button className="btn btn-danger sidebar-logout" onClick={onLogout}>Logout</button>
    </aside>
  );
}
