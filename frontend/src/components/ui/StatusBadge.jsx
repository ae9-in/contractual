const STATUS_CLASSES = {
  open: 'status-open',
  assigned: 'status-assigned',
  submitted: 'status-submitted',
  completed: 'status-completed',
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const cls = STATUS_CLASSES[key] || 'status-open';
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
