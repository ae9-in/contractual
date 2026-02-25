export default function Loader({ label = 'Loading...', inline = false, size = 'md' }) {
  return (
    <div className={inline ? 'loader-inline-wrap' : 'loader-wrap'} role="status" aria-live="polite">
      <span className={`loader loader-${size}${inline ? ' loader-inline' : ''}`} />
      {label ? <span className="loader-label">{label}</span> : null}
    </div>
  );
}
