import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Footer() {
  const year = new Date().getFullYear();
  const { isAuthenticated, user } = useAuth();

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

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-block">
          <p className="footer-brand">Contractual</p>
          <p className="footer-text">Simple Contracts. Real Results.</p>
          <p className="footer-copy">(c) {year} Contractual. All rights reserved.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          {isAuthenticated ? (
            roleLinks.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
