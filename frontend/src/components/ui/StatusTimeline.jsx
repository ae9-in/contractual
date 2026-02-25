const STEPS = ['Open', 'Assigned', 'Submitted', 'Completed'];

export default function StatusTimeline({ status }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="timeline" aria-label="Project status timeline">
      {STEPS.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';
        return (
          <div key={step} className={`timeline-step timeline-${state}`}>
            <span className="timeline-dot" />
            <span className="timeline-label">{step}</span>
          </div>
        );
      })}
    </div>
  );
}
