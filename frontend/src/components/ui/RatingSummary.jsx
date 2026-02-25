import Card from './Card';

function buildStars(value) {
  const full = Math.round(Number(value || 0));
  return Array.from({ length: 5 }, (_, index) => (index < full ? '\u2605' : '\u2606')).join('');
}

export default function RatingSummary({ summary, compact = false, className = '' }) {
  const safe = summary || { averageRating: 0, totalRatings: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const avg = Number(safe.averageRating || 0);
  const total = Number(safe.totalRatings || 0);
  const dist = safe.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (compact) {
    return (
      <Card className={`metric-card rating-compact ${className}`.trim()}>
        <p>Rating</p>
        <strong>{avg.toFixed(2)}</strong>
        <span className="rating-stars" aria-hidden="true">{buildStars(avg)}</span>
        <span className="rating-count">{total} review{total === 1 ? '' : 's'}</span>
      </Card>
    );
  }

  const maxCount = Math.max(1, ...Object.values(dist).map((value) => Number(value || 0)));

  return (
    <Card className={`rating-summary ${className}`.trim()}>
      <div className="rating-summary-head">
        <div>
          <p className="rating-kicker">Reputation</p>
          <h3 className="section-title">Your Rating</h3>
        </div>
        <div className="rating-score">
          <strong>{avg.toFixed(2)}</strong>
          <span className="rating-stars" aria-hidden="true">{buildStars(avg)}</span>
          <span className="rating-count">{total} review{total === 1 ? '' : 's'}</span>
        </div>
      </div>
      <div className="rating-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = Number(dist[star] || 0);
          const width = `${count === 0 ? 0 : Math.max(6, (count / maxCount) * 100)}%`;
          return (
            <div key={star} className="rating-bar-row">
              <span>{star}{'\u2605'}</span>
              <div className="rating-bar-track">
                <div className="rating-bar-fill" style={{ width }} />
              </div>
              <strong>{count}</strong>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
