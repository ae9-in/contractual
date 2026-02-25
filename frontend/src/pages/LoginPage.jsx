import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getApiErrorMessage, getApiFieldErrors } from '../utils/validation';
import { getStoredUserRaw } from '../utils/authStorage';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await login(form);
      const user = JSON.parse(getStoredUserRaw() || '{}');
      addToast('Login success', 'success');
      navigate(user.role === 'business' ? '/business/dashboard' : '/freelancer/dashboard');
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-enter grid auth-grid">
      <Card className="auth-card">
        <h2 className="section-title">Welcome Back</h2>
        <p className="muted">Sign in to continue managing projects on Contractual.</p>

        <form className="form form-top-gap" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isSubmitting} />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" placeholder="Enter password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={isSubmitting} />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

          {error && <p className="field-error">{error}</p>}

          <Button type="submit" loading={isSubmitting} loadingText="Logging in..." fullWidth>Login</Button>
        </form>

        <p className="muted section-gap-sm">No account? <Link to="/register"><strong>Create one</strong></Link></p>
      </Card>
    </section>
  );
}
