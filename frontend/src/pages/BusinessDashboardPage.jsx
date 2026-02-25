import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProjects } from '../services/projectService';
import { getNotifications, getUnreadProjectNotifications } from '../services/notificationService';
import { connectRealtime, onRealtime } from '../services/realtimeService';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatINR } from '../utils/currency';
import { formatDateOnly } from '../utils/date';

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadByProject, setUnreadByProject] = useState({});
  const [recentNotifications, setRecentNotifications] = useState([]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const { data } = await getMyProjects();
      setProjects(data.projects);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);
  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      try {
        const { data } = await getUnreadProjectNotifications();
        if (active) setUnreadByProject(data.unreadByProject || {});
      } catch {
        if (active) setUnreadByProject({});
      }
    };

    connectRealtime();
    const offNew = onRealtime('notifications:new', loadUnread);
    const offCount = onRealtime('notifications:count', loadUnread);
    loadUnread();

    return () => {
      active = false;
      offNew();
      offCount();
    };
  }, []);
  useEffect(() => {
    let active = true;
    const loadRecentNotifications = async () => {
      try {
        const { data } = await getNotifications();
        if (active) setRecentNotifications((data.notifications || []).slice(0, 3));
      } catch {
        if (active) setRecentNotifications([]);
      }
    };
    connectRealtime();
    const offNew = onRealtime('notifications:new', loadRecentNotifications);
    loadRecentNotifications();
    return () => {
      active = false;
      offNew();
    };
  }, []);
  const openCount = projects.filter((project) => project.status === 'Open').length;
  const assignedCount = projects.filter((project) => project.status === 'Assigned').length;
  const submittedCount = projects.filter((project) => project.status === 'Submitted').length;
  const completedCount = projects.filter((project) => project.status === 'Completed').length;
  const completionRate = projects.length ? Math.round((completedCount / projects.length) * 100) : 0;

  return (
    <section className="grid">
      <Card className="dashboard-hero dashboard-hero-business">
        <div className="dashboard-head">
          <div>
            <h2 className="section-title">Business Home</h2>
            <p className="muted">Track delivery performance and close projects with confidence.</p>
          </div>
          <div className="row">
            <Button to="/business/post-project" variant="primary">Post Project</Button>
            <Button to="/business/projects" variant="secondary">My Projects</Button>
          </div>
        </div>
        <div className="dashboard-visual" aria-hidden="true">
          <span className="visual-dot visual-dot-a" />
          <span className="visual-dot visual-dot-b" />
          <span className="visual-dot visual-dot-c" />
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-4">
          <Card className="metric-card skeleton-card" />
          <Card className="metric-card skeleton-card" />
          <Card className="metric-card skeleton-card" />
          <Card className="metric-card skeleton-card" />
        </div>
      ) : (
        <div className="grid grid-4 stagger-grid">
          <Link className="metric-link" to="/business/projects"><Card className="metric-card"><p>Total</p><strong>{projects.length}</strong></Card></Link>
          <Link className="metric-link" to="/business/projects?status=Open"><Card className="metric-card"><p>Open</p><strong>{openCount}</strong></Card></Link>
          <Link className="metric-link" to="/business/projects?status=Submitted"><Card className="metric-card"><p>Submitted</p><strong>{submittedCount}</strong></Card></Link>
          <Link className="metric-link" to="/business/projects?status=Completed"><Card className="metric-card"><p>Completed</p><strong>{completedCount}</strong></Card></Link>
        </div>
      )}

      {error && <p className="alert">{error}</p>}

      <div className="grid grid-2">
        <Card className="dashboard-panel stack">
          <div className="project-head">
            <h3>Pipeline Snapshot</h3>
            <span className="dashboard-subtitle">{completionRate}% completed</span>
          </div>
          <div className="pipeline-list">
            <Link className="pipeline-item" to="/business/projects?status=Open">
              <span>Open Projects</span>
              <strong>{openCount}</strong>
            </Link>
            <Link className="pipeline-item" to="/business/projects?status=Assigned">
              <span>Assigned</span>
              <strong>{assignedCount}</strong>
            </Link>
            <Link className="pipeline-item" to="/business/projects?status=Submitted">
              <span>Ready to Review</span>
              <strong>{submittedCount}</strong>
            </Link>
            <Link className="pipeline-item" to="/business/projects?status=Completed">
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </Link>
          </div>
        </Card>

        <Card className="dashboard-panel stack">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <Link className="action-tile" to="/business/post-project">
              <p className="rating-meta">Post New Project</p>
              <p className="muted">Create a project brief with files and references.</p>
            </Link>
            <Link className="action-tile" to="/business/projects">
              <p className="rating-meta">Manage Projects</p>
              <p className="muted">Review applications, progress, and final submissions.</p>
            </Link>
            <Link className="action-tile" to="/business/notifications">
              <p className="rating-meta">Open Notifications</p>
              <p className="muted">Track new applications and delivery updates.</p>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="stack">
        <div className="project-head">
          <h3>Recent Notifications</h3>
          <Button to="/business/notifications" variant="secondary">View All</Button>
        </div>
        {recentNotifications.length ? (
          <div className="grid">
            {recentNotifications.map((item) => (
              <div key={item.id} className={`notification-inline${item.isRead ? '' : ' notification-inline-unread'}`}>
                <p className="rating-meta">{item.title}</p>
                <p className="muted">{item.messageText}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No recent notifications.</p>
        )}
      </Card>

      {isLoading ? (
        <div className="grid grid-auto">
          <Card className="skeleton-card skeleton-project" />
          <Card className="skeleton-card skeleton-project" />
          <Card className="skeleton-card skeleton-project" />
        </div>
      ) : (
        <div className="grid grid-auto stagger-grid">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="project-card card-clickable"
              onClick={(event) => {
                if (event.target.closest('button, a, input, select, textarea, label')) return;
                navigate(`/projects/${project.id}`);
              }}
            >
              <div className="project-head">
                <h3><Link className="card-title-link" to={`/projects/${project.id}`}>{project.title}</Link></h3>
                <div className="row">
                  {Number(unreadByProject[project.id] || 0) > 0 && <span className="notif-badge">{unreadByProject[project.id]}</span>}
                  <StatusBadge status={project.status} />
                </div>
              </div>
              <p className="muted">Budget: {formatINR(project.budget)}</p>
              <p className="muted">Deadline: {formatDateOnly(project.deadline)}</p>
              <p className="muted">Assigned Freelancer: {project.freelancerId || 'Pending acceptance'}</p>
              {project.submissionText && <p className="muted">Submission Notes: {project.submissionText}</p>}
              {project.submissionLink && (
                <p className="muted">
                  Submission Link:{' '}
                  <a href={project.submissionLink} target="_blank" rel="noreferrer">{project.submissionLink}</a>
                </p>
              )}
              {(project.submissionFiles || []).length > 0 && (
                <p className="muted">Submission Files: {(project.submissionFiles || []).length}</p>
              )}
              <div className="row">
                <Button to={`/projects/${project.id}`} variant="secondary">View Details</Button>
              </div>
            </Card>
          ))}
          {!projects.length && (
            <Card className="stack dashboard-empty">
              <EmptyState message="No projects available yet." />
              <Button to="/business/post-project">Create Your First Project</Button>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
