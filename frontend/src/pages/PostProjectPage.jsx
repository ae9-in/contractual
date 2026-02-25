import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/projectService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SkillSelector from '../components/ui/SkillSelector';
import { getApiErrorMessage, getApiFieldErrors } from '../utils/validation';

export default function PostProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    skillsRequired: '',
    deadline: '',
    referenceLink: '',
    referenceFiles: [],
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      setIsSubmitting(true);
      await createProject({
        ...form,
        budget: Number(form.budget),
      });
      navigate('/business/dashboard');
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to create project'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="grid">
      <Card className="page-header-card">
        <h2 className="section-title">Post Project</h2>
        <p className="muted">Define scope clearly to attract the right freelancer quickly.</p>

        <form className="form form-top-gap" onSubmit={handleSubmit}>
          <label className="label" htmlFor="title">Project Title</label>
          <input id="title" className="input" placeholder="Landing page redesign" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="textarea" placeholder="Describe deliverables, timeline, and success criteria" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}

          <div className="grid grid-2">
            <div className="stack">
              <label className="label" htmlFor="budget">Budget (INR)</label>
              <input id="budget" className="input" type="number" placeholder="Enter amount in INR" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              {fieldErrors.budget && <p className="field-error">{fieldErrors.budget}</p>}
            </div>
            <div className="stack">
              <label className="label" htmlFor="deadline">Deadline</label>
              <input id="deadline" className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              {fieldErrors.deadline && <p className="field-error">{fieldErrors.deadline}</p>}
            </div>
          </div>

          <SkillSelector value={form.skillsRequired} onChange={(skillsRequired) => setForm({ ...form, skillsRequired })} label="Skills Required" />
          {fieldErrors.skillsRequired && <p className="field-error">{fieldErrors.skillsRequired}</p>}
          <label className="label" htmlFor="referenceLink">Project Reference URL (Optional)</label>
          <input
            id="referenceLink"
            className="input"
            placeholder="https://example.com/reference-doc"
            value={form.referenceLink}
            onChange={(e) => setForm({ ...form, referenceLink: e.target.value })}
          />
          {fieldErrors.referenceLink && <p className="field-error">{fieldErrors.referenceLink}</p>}
          <label className="label" htmlFor="referenceFiles">Project Reference Files (Optional)</label>
          <input
            id="referenceFiles"
            className="input"
            type="file"
            multiple
            onChange={(e) => setForm({ ...form, referenceFiles: Array.from(e.target.files || []) })}
          />

          {error && <p className="field-error">{error}</p>}
          <Button type="submit" variant="primary" disabled={isSubmitting} loading={isSubmitting} loadingText="Publishing...">Publish Project</Button>
        </form>
      </Card>
    </section>
  );
}
