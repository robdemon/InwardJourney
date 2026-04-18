export default function SessionBar({ sessions, current, onSelect }) {
  if (!sessions.length) return null;
  return (
    <div className="stg">
      {sessions.map((s, i) => (
        <button
          key={`${s.label}-${i}`}
          className={`sb${i === current ? ' a' : ''}`}
          onClick={() => onSelect(i)}
        >
          {s.firstDate ? `${s.firstDate} • ` : ''}
          {s.duration.toFixed(0)}min
        </button>
      ))}
    </div>
  );
}
