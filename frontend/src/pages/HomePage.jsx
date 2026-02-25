import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <section className="page-enter landing-minimal">
      <div className="landing-backdrop" aria-hidden="true">
        <span className="backdrop-blob blob-a" />
        <span className="backdrop-blob blob-b" />
        <span className="backdrop-blob blob-c" />
      </div>

      <div className="landing-content">
        <p className="landing-tagline">Simple Contracts. Real Results.</p>
        <h1 className="landing-title">Contractual</h1>
        <div className="row landing-cta">
          <Button to="/register" variant="primary">Post a Project</Button>
          <Button to="/login" variant="secondary">Find Work</Button>
        </div>
        <p className="muted landing-login">
          Already signed up? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}
