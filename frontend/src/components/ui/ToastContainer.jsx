export default function ToastContainer({ items }) {
  if (!items.length) return null;

  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      {items.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'success'}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
