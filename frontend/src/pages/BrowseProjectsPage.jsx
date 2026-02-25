import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applyForProject, getProjects } from '../services/projectService';
import { getProfile } from '../services/profileService';
import { useToast } from '../hooks/useToast';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SKILLS_TAXONOMY } from '../data/skillsTaxonomy';
import { formatINR } from '../utils/currency';
import { formatDateOnly } from '../utils/date';

function parseSkills(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function matchesAnySkill(projectSkillsRaw, preferredSkills) {
  const projectSkills = parseSkills(projectSkillsRaw);
  if (!preferredSkills.length) return true;
  return projectSkills.some((skill) => preferredSkills.includes(skill));
}

export default function BrowseProjectsPage() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ minBudget: '', maxBudget: '', category: '' });
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [usePreferences, setUsePreferences] = useState(searchParams.get('pref') !== '0');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [applyingProjectId, setApplyingProjectId] = useState(null);

  const loadProjects = async () => {
    const params = { status: 'Open' };
    if (filters.minBudget) params.minBudget = Number(filters.minBudget);
    if (filters.maxBudget) params.maxBudget = Number(filters.maxBudget);

    try {
      setIsLoading(true);
      const { data } = await getProjects(params);
      let filtered = data.projects;

      if (filters.category) {
        const group = SKILLS_TAXONOMY.find((item) => item.category === filters.category);
        const allowedSkills = new Set((group?.subcategories || []).flatMap((sub) => sub.skills));
        filtered = data.projects.filter((project) => String(project.skillsRequired || '')
          .split(',')
          .map((skill) => skill.trim())
          .some((skill) => allowedSkills.has(skill)));
      }

      setProjects(filtered);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfile();
        setPreferredSkills(parseSkills(data.profile?.skills));
      } catch {
        setPreferredSkills([]);
      }
    })();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (usePreferences && preferredSkills.length) {
      filtered = filtered.filter((project) => matchesAnySkill(project.skillsRequired, preferredSkills));
    }
    return filtered;
  }, [projects, usePreferences, preferredSkills]);

  const togglePreferences = () => {
    setUsePreferences((prev) => {
      const next = !prev;
      if (next) {
        setFilters((current) => ({ ...current, category: '' }));
      }
      return next;
    });
  };

  const handleApply = async (projectId) => {
    try {
      setApplyingProjectId(projectId);
      await applyForProject(projectId, {});
      addToast('Application submitted', 'success');
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply for project');
    } finally {
      setApplyingProjectId(null);
    }
  };

  return (
    <section className="grid">
      <Card className="stack page-header-card">
        <h2 className="section-title">Browse Projects</h2>
        <p className="muted">Filter open projects and apply to projects that match your skills.</p>
        <div className="row">
          <Button
            variant={usePreferences ? 'primary' : 'secondary'}
            onClick={togglePreferences}
            disabled={!preferredSkills.length}
          >
            {usePreferences ? 'Showing My Preferences' : 'Use My Preferences'}
          </Button>
          <span className="muted">
            {preferredSkills.length
              ? `${preferredSkills.length} saved skills from profile`
              : 'No saved skills in profile'}
          </span>
        </div>
        <div className="grid grid-3">
          <input className="input" placeholder="Min Budget (INR)" type="number" value={filters.minBudget} onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })} disabled={isLoading} />
          <input className="input" placeholder="Max Budget (INR)" type="number" value={filters.maxBudget} onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })} disabled={isLoading} />
          <select
            className="select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            disabled={isLoading || usePreferences}
          >
            {usePreferences ? (
              <option value="">Category locked by My Preferences</option>
            ) : (
              <>
                <option value="">All Categories</option>
                {SKILLS_TAXONOMY.map((item) => (
                  <option key={item.category} value={item.category}>{item.category}</option>
                ))}
              </>
            )}
          </select>
        </div>
        <Button variant="secondary" onClick={loadProjects} disabled={isLoading} loading={isLoading} loadingText="Loading projects...">Apply Filters</Button>
      </Card>

      {error && <p className="alert">{error}</p>}

      {isLoading ? <Loader label="Fetching projects..." /> : (
        <div className="grid grid-auto stagger-grid">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="project-card project-list-card">
              <div className="project-head">
                <h3>{project.title}</h3>
                <StatusBadge status={project.status} />
              </div>
              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <p className="detail-meta-label">Budget</p>
                  <p className="detail-meta-value">{formatINR(project.budget)}</p>
                </div>
                <div className="detail-meta-item">
                  <p className="detail-meta-label">Deadline</p>
                  <p className="detail-meta-value">{formatDateOnly(project.deadline)}</p>
                </div>
              </div>
              <p className="muted">Skills: {project.skillsRequired}</p>
              <p className="muted">Business: {project.businessName}</p>
              {project.hasApplied && <p className="muted"><strong>Application:</strong> {project.applicationStatus || 'Pending'}</p>}
              <div className="row card-actions">
                <Button to={`/projects/${project.id}`} variant="secondary">View Details</Button>
                <Button
                  onClick={() => handleApply(project.id)}
                  disabled={project.hasApplied || applyingProjectId === project.id}
                  loading={applyingProjectId === project.id}
                  loadingText="Applying..."
                >
                  {project.hasApplied ? 'Applied' : 'Apply Project'}
                </Button>
              </div>
            </Card>
          ))}
          {!filteredProjects.length && (
            <Card className="stack dashboard-empty">
              <EmptyState
                message={usePreferences
                  ? 'No projects match your saved preferences yet.'
                  : 'No projects available yet.'}
              />
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
