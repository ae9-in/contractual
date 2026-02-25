import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyProjects } from '../services/projectService';
import { getUnreadProjectNotifications } from '../services/notificationService';
import { connectRealtime, onRealtime } from '../services/realtimeService';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatINR } from '../utils/currency';
import { formatDateOnly } from '../utils/date';

export default function MyProjectsPage() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadByProject, setUnreadByProject] = useState({});

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

  useEffect(() => { loadProjects(); }, []);
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

  const selectedStatus = searchParams.get('status');
  const filteredProjects = useMemo(
    () => (selectedStatus ? projects.filter((p) => p.status === selectedStatus) : projects),
    [projects, selectedStatus],
  );
  const submittedProjects = useMemo(() => filteredProjects.filter((p) => p.status === 'Submitted'), [filteredProjects]);

  return (
    <section className="grid">
      <Card className="stack page-header-card">
        <h2 className="section-title">My Projects</h2>
        <p className="muted">Full list of projects posted by your business account.{selectedStatus ? ` Filter: ${selectedStatus}` : ''}</p>
        <div className="row status-filter-bar">
          <Button to="/business/projects" variant={!selectedStatus ? 'primary' : 'secondary'}>All</Button>
          <Button to="/business/projects?status=Open" variant={selectedStatus === 'Open' ? 'primary' : 'secondary'}>Open</Button>
          <Button to="/business/projects?status=Assigned" variant={selectedStatus === 'Assigned' ? 'primary' : 'secondary'}>Assigned</Button>
          <Button to="/business/projects?status=Submitted" variant={selectedStatus === 'Submitted' ? 'primary' : 'secondary'}>Submitted</Button>
          <Button to="/business/projects?status=Completed" variant={selectedStatus === 'Completed' ? 'primary' : 'secondary'}>Completed</Button>
        </div>
      </Card>
      {error && <p className="alert">{error}</p>}

      {isLoading ? <Loader label="Loading your projects..." /> : (
        <>
          <div className="grid grid-auto">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="project-card">
                <div className="project-head">
                  <h3>{project.title}</h3>
                  <div className="row">
                    {Number(unreadByProject[project.id] || 0) > 0 && <span className="notif-badge">{unreadByProject[project.id]}</span>}
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <p className="muted">Budget: {formatINR(project.budget)}</p>
                <p className="muted">Deadline: {formatDateOnly(project.deadline)}</p>
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
            {!filteredProjects.length && <EmptyState message="No projects available yet." />}
          </div>
          {!submittedProjects.length && <EmptyState message="No submissions yet." />}
        </>
      )}
    </section>
  );
}
