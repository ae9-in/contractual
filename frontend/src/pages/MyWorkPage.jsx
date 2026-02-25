import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProjects, submitProject } from '../services/projectService';
import { useToast } from '../hooks/useToast';
import { getUnreadProjectNotifications } from '../services/notificationService';
import { connectRealtime, onRealtime } from '../services/realtimeService';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatINR } from '../utils/currency';

export default function MyWorkPage() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [submissionText, setSubmissionText] = useState({});
  const [submissionLink, setSubmissionLink] = useState({});
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submittingProjectId, setSubmittingProjectId] = useState(null);
  const [unreadByProject, setUnreadByProject] = useState({});

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const { data } = await getProjects({ assignedToMe: true });
      setProjects(data.projects);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load work items');
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

  const selectedStatus = searchParams.get('status');
  const filteredProjects = selectedStatus ? projects.filter((project) => project.status === selectedStatus) : projects;

  const handleSubmitWork = async (projectId) => {
    try {
      setSubmittingProjectId(projectId);
      await submitProject(projectId, {
        submissionText: submissionText[projectId] || '',
        submissionLink: submissionLink[projectId] || '',
        files: submissionFiles[projectId] || [],
      });
      addToast('Submission successful', 'success');
      setSubmissionText((prev) => ({ ...prev, [projectId]: '' }));
      setSubmissionLink((prev) => ({ ...prev, [projectId]: '' }));
      setSubmissionFiles((prev) => ({ ...prev, [projectId]: [] }));
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit work');
    } finally {
      setSubmittingProjectId(null);
    }
  };

  return (
    <section className="grid">
      <Card className="stack page-header-card">
        <h2 className="section-title">My Work</h2>
        <p className="muted">Accepted projects and their current delivery status.{selectedStatus ? ` Filter: ${selectedStatus}` : ''}</p>
        <div className="row status-filter-bar">
          <Button to="/freelancer/work" variant={!selectedStatus ? 'primary' : 'secondary'}>All</Button>
          <Button to="/freelancer/work?status=Assigned" variant={selectedStatus === 'Assigned' ? 'primary' : 'secondary'}>Assigned</Button>
          <Button to="/freelancer/work?status=Submitted" variant={selectedStatus === 'Submitted' ? 'primary' : 'secondary'}>Submitted</Button>
          <Button to="/freelancer/work?status=Completed" variant={selectedStatus === 'Completed' ? 'primary' : 'secondary'}>Completed</Button>
        </div>
      </Card>
      {error && <p className="alert">{error}</p>}

      {isLoading ? <Loader label="Loading your work..." /> : (
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
              <div className="row">
                <Button to={`/projects/${project.id}`} variant="secondary">View Details</Button>
              </div>

              {project.status === 'Assigned' && (
                <div className="stack">
                  <label className="label" htmlFor={`submission-work-${project.id}`}>Submission Notes</label>
                  <textarea id={`submission-work-${project.id}`} className="textarea" value={submissionText[project.id] || ''} onChange={(e) => setSubmissionText((prev) => ({ ...prev, [project.id]: e.target.value }))} disabled={submittingProjectId === project.id} />
                  <label className="label" htmlFor={`submission-work-link-${project.id}`}>Submission URL</label>
                  <input id={`submission-work-link-${project.id}`} className="input" placeholder="https://example.com/deliverables" value={submissionLink[project.id] || ''} onChange={(e) => setSubmissionLink((prev) => ({ ...prev, [project.id]: e.target.value }))} disabled={submittingProjectId === project.id} />
                  <label className="label" htmlFor={`submission-work-files-${project.id}`}>Attach Files</label>
                  <input id={`submission-work-files-${project.id}`} className="input" type="file" multiple onChange={(e) => setSubmissionFiles((prev) => ({ ...prev, [project.id]: Array.from(e.target.files || []) }))} disabled={submittingProjectId === project.id} />
                  <Button variant="secondary" onClick={() => handleSubmitWork(project.id)} disabled={submittingProjectId === project.id} loading={submittingProjectId === project.id} loadingText="Submitting...">Submit Work</Button>
                </div>
              )}
            </Card>
          ))}
          {!filteredProjects.length && <EmptyState message="You haven't accepted any projects yet." />}
        </div>
      )}
    </section>
  );
}
