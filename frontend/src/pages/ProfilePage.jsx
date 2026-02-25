import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/profileService';
import { getUserRatingSummary } from '../services/ratingService';
import { getProjects } from '../services/projectService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SkillSelector from '../components/ui/SkillSelector';
import RatingSummary from '../components/ui/RatingSummary';
import { getApiErrorMessage, getApiFieldErrors } from '../utils/validation';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  const defaultSummary = { averageRating: 0, totalRatings: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const [form, setForm] = useState({ skills: '', bio: '', portfolioLink: '', experienceYears: 0 });
  const [ratingSummary, setRatingSummary] = useState(defaultSummary);
  const [workStats, setWorkStats] = useState({ completed: 0, active: 0, total: 0 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfile();
        setForm(data.profile);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      }
    })();
  }, []);
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await getUserRatingSummary(user.id);
        setRatingSummary(data.summary || defaultSummary);
      } catch {
        setRatingSummary(defaultSummary);
      }
    })();
  }, [user?.id]);
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await getProjects({ assignedToMe: true });
        const projects = data.projects || [];
        const completed = projects.filter((project) => project.status === 'Completed').length;
        const active = projects.filter((project) => project.status === 'Assigned' || project.status === 'Submitted').length;
        setWorkStats({ completed, active, total: projects.length });
      } catch {
        setWorkStats({ completed: 0, active: 0, total: 0 });
      }
    })();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setFieldErrors({});
    try {
      await updateProfile({ ...form, experienceYears: Number(form.experienceYears) });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to update profile'));
    }
  };

  return (
    <section className="grid">
      <Card className="page-header-card">
        <h2 className="section-title">Freelancer Profile</h2>
        <p className="muted">Showcase your strengths to get accepted faster.</p>
        <RatingSummary summary={ratingSummary} className="rating-profile-card" />
        <div className="grid grid-3 profile-stats-grid">
          <Card className="metric-card"><p>Completed Projects</p><strong>{workStats.completed}</strong></Card>
          <Card className="metric-card"><p>Active Projects</p><strong>{workStats.active}</strong></Card>
          <Card className="metric-card"><p>Total Accepted</p><strong>{workStats.total}</strong></Card>
        </div>

        <form className="form form-top-gap" onSubmit={handleSubmit}>
          <SkillSelector value={form.skills} onChange={(skills) => setForm({ ...form, skills })} label="Skills" />
          {fieldErrors.skills && <p className="field-error">{fieldErrors.skills}</p>}
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" className="textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          {fieldErrors.bio && <p className="field-error">{fieldErrors.bio}</p>}

          <div className="grid grid-2">
            <div className="stack">
              <label className="label" htmlFor="portfolioLink">Portfolio Link</label>
              <input id="portfolioLink" className="input" value={form.portfolioLink} onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })} />
              {fieldErrors.portfolioLink && <p className="field-error">{fieldErrors.portfolioLink}</p>}
            </div>
            <div className="stack">
              <label className="label" htmlFor="experienceYears">Experience (Years)</label>
              <input id="experienceYears" className="input" type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
              {fieldErrors.experienceYears && <p className="field-error">{fieldErrors.experienceYears}</p>}
            </div>
          </div>

          <Button type="submit">Save Profile</Button>
        </form>

        {message && <p className="alert alert-success section-gap-sm">{message}</p>}
        {error && <p className="field-error section-gap-sm">{error}</p>}
      </Card>
    </section>
  );
}
