export default function SessionBar({ sessions, current, onSelect }) {
  if (!sessions.length) return null;
  const individualCount = sessions.filter((s) => !s.isCombined).length;
  return (
    <div className="stg">
      {sessions.map((s, i) => {
        const label = s.isCombined
          ? `◆ All · ${individualCount} sessions · ${s.duration.toFixed(0)}min`
          : `${s.firstDate ? s.firstDate + ' • ' : ''}${s.duration.toFixed(0)}min`;
        return (
          <button
            key={`${s.label}-${i}`}
            className={`sb${i === current ? ' a' : ''}${s.isCombined ? ' sb-combined' : ''}`}
            onClick={() => onSelect(i)}
            title={s.isCombined ? 'Concatenated timeline of all uploaded sessions' : s.label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
