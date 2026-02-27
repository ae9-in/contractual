import { motion } from 'framer-motion';

export default function PremiumHero({
  label = 'WORKSPACE',
  title,
  subtitle,
  leftBadge = 'C',
  showBadge = false,
  right,
  actions,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'relative',
        borderRadius: '30px',
        padding: '30px clamp(20px, 4vw, 36px)',
        background: 'linear-gradient(135deg, #0f1f48 0%, #19396e 100%)',
        color: '#e2e8f0',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.25,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {showBadge && (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  boxShadow: '0 16px 34px rgba(59,130,246,0.35)',
                  flexShrink: 0,
                }}
              >
                {leftBadge}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(226,232,240,0.7)', textTransform: 'uppercase' }}>
                {label}
              </p>
              <h2 className="premium-hero-title" style={{ margin: '2px 0 0', fontSize: 'clamp(1.8rem, 3.2vw, 2.7rem)', lineHeight: 1.1, fontWeight: 900, color: '#f8fafc' }}>
                {title}
              </h2>
              {subtitle && (
                <p className="premium-hero-subtitle" style={{ margin: '6px 0 0', fontSize: '1.02rem', color: 'rgba(226,232,240,0.75)', fontWeight: 600 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {right}
        </div>
        {actions && <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </motion.div>
  );
}
