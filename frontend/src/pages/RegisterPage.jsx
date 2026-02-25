import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getApiErrorMessage, getApiFieldErrors } from '../utils/validation';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-enter grid auth-grid">
      <Card className="auth-card">
        <h2 className="section-title">Create Your Account</h2>
        <p className="muted">Choose your role to start contracting with clarity.</p>

        <form className="form form-top-gap" onSubmit={handleSubmit}>
          <label className="label" htmlFor="name">Full Name</label>
          <input id="name" className="input" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}

          <label className="label" htmlFor="reg-email">Email</label>
          <input id="reg-email" className="input" placeholder="you@domain.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isSubmitting} />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

          <label className="label" htmlFor="reg-password">Password</label>
          <input id="reg-password" className="input" placeholder="At least 8 characters" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={isSubmitting} />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

          <label className="label" htmlFor="role">Role</label>
          <select id="role" className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={isSubmitting}>
            <option value="freelancer">Freelancer</option>
            <option value="business">Business</option>
          </select>
          {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}

          {error && <p className="field-error">{error}</p>}

          <Button type="submit" loading={isSubmitting} loadingText="Registering..." fullWidth>Register</Button>
        </form>

        <p className="muted section-gap-sm">Already registered? <Link to="/login"><strong>Sign in</strong></Link></p>
      </Card>
    </section>
  );
}
