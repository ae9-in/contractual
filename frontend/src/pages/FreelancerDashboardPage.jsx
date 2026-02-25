import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, submitProject } from '../services/projectService';
import { useToast } from '../hooks/useToast';
import { getNotifications, getUnreadProjectNotifications } from '../services/notificationService';
import { connectRealtime, onRealtime } from '../services/realtimeService';
import { getUserRatingSummary } from '../services/ratingService';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RatingSummary from '../components/ui/RatingSummary';
import { formatINR } from '../utils/currency';

export default function FreelancerDashboardPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [submissionText, setSubmissionText] = useState({});
  const [submissionLink, setSubmissionLink] = useState({});
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submittingProjectId, setSubmittingProjectId] = useState(null);
  const [unreadByProject, setUnreadByProject] = useState({});
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalRatings: 0 });
  const [recentNotifications, setRecentNotifications] = useState([]);

  const loadAssignedProjects = async () => {
    try {
      setIsLoading(true);
      const { data } = await getProjects({ assignedToMe: true });
      setProjects(data.projects);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assigned projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAssignedProjects(); }, []);
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
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await getUserRatingSummary(user.id);
        setRatingSummary(data.summary || { averageRating: 0, totalRatings: 0 });
      } catch {
        setRatingSummary({ averageRating: 0, totalRatings: 0 });
      }
    })();
  }, [user?.id]);

  const handleSubmitWork = async (projectId) => {
    try {
      setSubmittingProjectId(projectId);
      await submitProject(projectId, {
        submissionText: submissionText[projectId] || '',
        submissionLink: submissionLink[projectId] || '',
        files: submissionFiles[projectId] || [],
      });
      setSubmissionText((prev) => ({ ...prev, [projectId]: '' }));
      setSubmissionLink((prev) => ({ ...prev, [projectId]: '' }));
      setSubmissionFiles((prev) => ({ ...prev, [projectId]: [] }));
      addToast('Submission successful', 'success');
      loadAssignedProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit work');
    } finally {
      setSubmittingProjectId(null);
    }
  };

  const assignedCount = projects.filter((project) => project.status === 'Assigned').length;
  const submittedCount = projects.filter((project) => project.status === 'Submitted').length;
  const completedCount = projects.filter((project) => project.status === 'Completed').length;
  const inReviewCount = submittedCount;

  return (
    <section className="grid">
      <Card className="dashboard-hero dashboard-hero-freelancer">
        <div className="dashboard-head">
          <div>
            <h2 className="section-title">Freelancer Home</h2>
            <p className="muted">Monitor your delivery pipeline and keep submissions moving.</p>
          </div>
          <div className="row">
            <Button to="/freelancer/projects" variant="primary">Browse Projects</Button>
            <Button to="/freelancer/work" variant="secondary">My Work</Button>
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
          <Link className="metric-link" to="/freelancer/work"><Card className="metric-card"><p>Accepted</p><strong>{projects.length}</strong></Card></Link>
          <Link className="metric-link" to="/freelancer/work?status=Assigned"><Card className="metric-card"><p>Assigned</p><strong>{assignedCount}</strong></Card></Link>
          <Link className="metric-link" to="/freelancer/work?status=Submitted"><Card className="metric-card"><p>Submitted</p><strong>{submittedCount}</strong></Card></Link>
          <Link className="metric-link" to="/freelancer/work?status=Completed"><Card className="metric-card"><p>Completed</p><strong>{completedCount}</strong></Card></Link>
          <Link className="metric-link" to="/freelancer/profile"><RatingSummary summary={ratingSummary} compact /></Link>
        </div>
      )}
      {error && <p className="alert">{error}</p>}

      <div className="grid grid-2">
        <Card className="dashboard-panel stack">
          <div className="project-head">
            <h3>Delivery Snapshot</h3>
            <span className="dashboard-subtitle">{projects.length} active assignments</span>
          </div>
          <div className="pipeline-list">
            <Link className="pipeline-item" to="/freelancer/work?status=Assigned">
              <span>Assigned</span>
              <strong>{assignedCount}</strong>
            </Link>
            <Link className="pipeline-item" to="/freelancer/work?status=Submitted">
              <span>In Review</span>
              <strong>{inReviewCount}</strong>
            </Link>
            <Link className="pipeline-item" to="/freelancer/work?status=Completed">
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </Link>
            <Link className="pipeline-item" to="/freelancer/profile">
              <span>Profile Rating</span>
              <strong>{Number(ratingSummary?.averageRating || 0).toFixed(1)}</strong>
            </Link>
          </div>
        </Card>

        <Card className="dashboard-panel stack">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <Link className="action-tile" to="/freelancer/projects">
              <p className="rating-meta">Browse Projects</p>
              <p className="muted">Find opportunities based on your profile skills.</p>
            </Link>
            <Link className="action-tile" to="/freelancer/work">
              <p className="rating-meta">Track My Work</p>
              <p className="muted">Open assigned projects and submit deliverables fast.</p>
            </Link>
            <Link className="action-tile" to="/freelancer/notifications">
              <p className="rating-meta">Check Notifications</p>
              <p className="muted">Stay updated on applications and payment events.</p>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="stack">
        <div className="project-head">
          <h3>Recent Notifications</h3>
          <Button to="/freelancer/notifications" variant="secondary">View All</Button>
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
              <p className="muted">Business: {project.businessName || 'Business'}</p>
              <Button to={`/projects/${project.id}`} variant="secondary">Open Details</Button>

              {project.status === 'Assigned' && (
                <div className="stack">
                  <label className="label" htmlFor={`submission-${project.id}`}>Submission Notes</label>
                  <textarea id={`submission-${project.id}`} className="textarea" value={submissionText[project.id] || ''} onChange={(e) => setSubmissionText((prev) => ({ ...prev, [project.id]: e.target.value }))} disabled={submittingProjectId === project.id} />
                  <label className="label" htmlFor={`submission-link-${project.id}`}>Submission URL</label>
                  <input id={`submission-link-${project.id}`} className="input" placeholder="https://example.com/deliverables" value={submissionLink[project.id] || ''} onChange={(e) => setSubmissionLink((prev) => ({ ...prev, [project.id]: e.target.value }))} disabled={submittingProjectId === project.id} />
                  <label className="label" htmlFor={`submission-files-${project.id}`}>Attach Files</label>
                  <input id={`submission-files-${project.id}`} className="input" type="file" multiple onChange={(e) => setSubmissionFiles((prev) => ({ ...prev, [project.id]: Array.from(e.target.files || []) }))} disabled={submittingProjectId === project.id} />
                  <Button variant="secondary" onClick={() => handleSubmitWork(project.id)} disabled={submittingProjectId === project.id} loading={submittingProjectId === project.id} loadingText="Submitting...">Submit Work</Button>
                </div>
              )}
            </Card>
          ))}
          {!projects.length && (
            <Card className="stack dashboard-empty">
              <EmptyState message="You haven't accepted any projects yet." />
              <Button to="/freelancer/projects">Find Your First Project</Button>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
