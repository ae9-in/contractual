import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Send,
  CheckCircle2,
  Filter,
  ChevronRight,
  Clock,
  ArrowRight,
  Zap,
  Layout,
  Paperclip,
  Globe
} from 'lucide-react';
import { getProjects, submitProject } from '../services/projectService';
import { useToast } from '../hooks/useToast';
import { getUnreadProjectNotifications } from '../services/notificationService';
import { connectRealtime, onRealtime } from '../services/realtimeService';
import StatusBadge from '../components/ui/StatusBadge';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PremiumHero from '../components/ui/PremiumHero';
import { formatINR } from '../utils/currency';

export default function MyWorkPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
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
      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load work items');
      setProjects([]);
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
  const filteredProjects = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    return selectedStatus ? safeProjects.filter((p) => p.status === selectedStatus) : safeProjects;
  }, [projects, selectedStatus]);

  const handleSubmitWork = async (projectId) => {
    try {
      if (!String(submissionText[projectId] || '').trim() || String(submissionText[projectId] || '').trim().length < 3) {
        setError('Please add at least 3 characters in delivery notes before submitting.');
        return;
      }
      setSubmittingProjectId(projectId);
      await submitProject(projectId, {
        submissionText: submissionText[projectId] || '',
        submissionLink: submissionLink[projectId] || '',
        files: submissionFiles[projectId] || [],
      });
      addToast('Work submitted successfully', 'success');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const setStatus = (status) => {
    if (!status) {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid"
      style={{ gap: '32px' }}
    >
      <motion.div variants={itemVariants}>
        <PremiumHero
          label="Freelancer Workspace"
          title="My Work"
          subtitle="Track your accepted gigs and streamline your delivery process."
          actions={(
            <Button variant="primary" to="/freelancer/projects" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} /> Find More Gigs
            </Button>
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
          <Filter size={16} /> Filter by Progress:
        </div>
        {[
          { id: null, label: 'All Jobs' },
          { id: 'Assigned', label: 'Active (Assigned)' },
          { id: 'Submitted', label: 'In Review' },
          { id: 'Completed', label: 'Completed' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => setStatus(btn.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedStatus === btn.id ? '#4f46e5' : '#f1f5f9',
              color: selectedStatus === btn.id ? 'white' : '#64748b',
              transition: 'all 0.2s',
              boxShadow: selectedStatus === btn.id ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'
            }}
          >
            {btn.label}
          </button>
        ))}
      </motion.div>

      {error && <motion.p variants={itemVariants} className="alert alert-danger">{error}</motion.p>}

      {isLoading ? (
        <div className="grid grid-auto">
          {[1, 2, 3].map(i => <Card key={i} className="skeleton-card" style={{ height: '240px', borderRadius: '24px' }} />)}
        </div>
      ) : (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-auto stagger-grid">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(15,23,42,0.08)' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{ background: 'white', borderRadius: '24px', padding: '28px', border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', height: '100%' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: '"Outfit", sans-serif', lineHeight: 1.3 }}>
                        {project.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {Number(unreadByProject[project.id] || 0) > 0 && (
                          <span style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>
                            New Message
                          </span>
                        )}
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Contract Value</p>
                      <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>{formatINR(project.budget)}</p>
                    </div>
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="secondary" className="btn-sm" style={{ borderRadius: '10px' }}>
                        Details <ChevronRight size={14} />
                      </Button>
                    </Link>
                  </div>

                  {project.status === 'Assigned' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onClick={e => e.stopPropagation()}
                      style={{ background: '#f5f3ff', padding: '24px', borderRadius: '20px', border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4f46e5' }}>
                        <Zap size={20} fill="#4f46e5" />
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>Deliverable Submission</span>
                      </div>

                      <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                          <Globe size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            className="input"
                            placeholder="URL to work (e.g. GitHub, Google Drive)"
                            style={{ paddingLeft: '44px', background: 'white' }}
                            value={submissionLink[project.id] || ''}
                            onChange={(e) => setSubmissionLink((prev) => ({ ...prev, [project.id]: e.target.value }))}
                          />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <Layout size={16} style={{ position: 'absolute', left: '16px', top: '20px', color: '#94a3b8' }} />
                          <textarea
                            className="textarea"
                            placeholder="Add brief delivery notes for the client..."
                            style={{ paddingLeft: '44px', background: 'white', minHeight: '100px' }}
                            value={submissionText[project.id] || ''}
                            onChange={(e) => setSubmissionText((prev) => ({ ...prev, [project.id]: e.target.value }))}
                          />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <Paperclip size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                          <input
                            className="input"
                            type="file"
                            multiple
                            style={{ paddingLeft: '44px', background: 'white' }}
                            onChange={(e) => setSubmissionFiles((prev) => ({ ...prev, [project.id]: Array.from(e.target.files || []) }))}
                          />
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        style={{ width: '100%', height: '48px', fontWeight: 800 }}
                        onClick={() => handleSubmitWork(project.id)}
                        disabled={submittingProjectId === project.id}
                        loading={submittingProjectId === project.id}
                      >
                        <Send size={18} style={{ marginRight: '8px' }} /> Confirm Delivery
                      </Button>
                    </motion.div>
                  )}

                  {project.status === 'Submitted' && (
                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Clock size={20} color="#059669" />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#065f46' }}>In Review</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#047857' }}>Awaiting client approval and payment release.</p>
                      </div>
                    </div>
                  )}

                  {project.status === 'Completed' && (
                    <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2 size={20} color="#0284c7" />
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0369a1' }}>Contract Completed & Paid</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
              borderRadius: '24px',
              border: '1px dashed #cbd5e1',
              padding: '56px 28px',
              textAlign: 'center',
              display: 'grid',
              gap: '12px',
              placeItems: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>No Work Items Yet</h3>
              <p style={{ margin: 0, color: '#64748b', maxWidth: '560px', fontWeight: 600 }}>
                {selectedStatus
                  ? `You have no projects currently in the "${selectedStatus}" phase.`
                  : 'No projects assigned to you yet. Browse projects to get started.'}
              </p>
              {!selectedStatus && (
                <Button to="/freelancer/projects" style={{ marginTop: '6px' }}>Find My First Project</Button>
              )}
            </div>
          )}
        </>
      )}
    </motion.section>
  );
}
