import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  style = {}
}) {
  const cls = `btn btn-${variant}${fullWidth ? ' btn-full' : ''}${className ? ` ${className}` : ''}`;

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  if (to) {
    return (
      <motion.div {...motionProps} style={{ display: 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
        <Link to={to} className={cls} style={style}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      style={style}
    >
      {loading ? <Loader inline size="sm" label={loadingText} /> : children}
    </motion.button>
  );
}
