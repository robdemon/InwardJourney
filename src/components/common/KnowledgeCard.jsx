export default function KnowledgeCard({
  title,
  subtitle,
  body,
  reference,
  accent = 'var(--border)',
  badge,
  value,
  valueLabel,
  interpretation,
  children
}) {
  return (
    <div className="kcard" style={{ borderLeftColor: accent }}>
      {badge ? <span className={`badge ${badge.kind || ''}`}>{badge.text}</span> : null}
      {subtitle ? <div className="ks">{subtitle}</div> : null}
      <div className="kt" style={{ color: accent }}>{title}</div>
      {value !== undefined && value !== null ? (
        <div className="kvalue">
          <div className="kvn" style={{ color: accent }}>{value}</div>
          {valueLabel ? <div className="kvl">{valueLabel}</div> : null}
          {interpretation ? <div className="kvi" style={{ color: accent }}>{interpretation}</div> : null}
        </div>
      ) : null}
      {body ? <div className="kb">{body}</div> : null}
      {children}
      {reference ? <div className="ref">{reference}</div> : null}
    </div>
  );
}
