import { Link } from 'react-router-dom';
import Loader from './Loader';

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'Processing...',
  className = '',
  to,
  fullWidth = false,
}) {
  const cls = `btn btn-${variant}${fullWidth ? ' btn-full' : ''}${className ? ` ${className}` : ''}`;

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading} aria-busy={loading}>
      {loading ? <Loader inline size="sm" label={loadingText} /> : children}
    </button>
  );
}
