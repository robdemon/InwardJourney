export default function KnowledgeCard({ title, subtitle, body, reference, accent = 'var(--border)', badge, children }) {
  return (
    <div className="kcard" style={{ borderLeftColor: accent }}>
      {badge ? <span className={`badge ${badge.kind || ''}`}>{badge.text}</span> : null}
      {subtitle ? <div className="ks">{subtitle}</div> : null}
      <div className="kt" style={{ color: accent }}>{title}</div>
      {body ? <div className="kb">{body}</div> : null}
      {children}
      {reference ? <div className="ref">{reference}</div> : null}
    </div>
  );
}
