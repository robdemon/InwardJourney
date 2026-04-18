import { C } from '../../scripts/constants.js';
import { segMean } from '../../scripts/metrics.js';

export default function ConclusionTab({ session }) {
  const ss = session.segments;
  const ae = segMean(ss, 'effort');
  const ep = ss.filter((s) => s.dominant_chitta === 'Ekāgra').length / ss.length * 100;
  const peakAlpha = Math.max(...ss.map((s) => s.alpha));

  const observations = [];
  if (ae > 0.1) observations.push({ c: C.amber, t: <><strong>Effort elevated ({ae.toFixed(2)}).</strong> Try resting in awareness. YS 2.47: perfection through relaxation of effort.</> });
  if (ae < 0.03 && ss.some((s) => s.ekagra > 0.5)) observations.push({ c: C.green, t: <><strong>Effortless awareness achieved.</strong> Ekāgra with near-zero effort — the Dhāraṇā → Dhyāna transition.</> });
  if (session.blink_rate > 10) observations.push({ c: C.teal, t: <><strong>Blinks elevated ({session.blink_rate}/min).</strong> Settle eyes before concentration.</> });
  if (session.blink_rate < 5 && session.blink_rate > 0) observations.push({
    c: C.green,
    t: <><strong>Low blinks ({session.blink_rate}/min).</strong> Pratyāhāra establishing.{session.blink_rate < 2 ? ' Near-cessation.' : ''}</>
  });
  if (session.hr_max > 100) observations.push({ c: C.red, t: <><strong>HR spike {session.hr_max} bpm.</strong> Reduce concentration intensity.</> });
  if (session.hr_mean < 65) observations.push({ c: C.green, t: <><strong>Low HR ({session.hr_mean} bpm).</strong> Deep parasympathetic rest.</> });
  if (session.gamma_neg_pct > 90) observations.push({
    c: C.purple,
    t: <><strong>γ deeply suppressed ({session.gamma_neg_pct}% negative).</strong> Cognitive processing minimised.</>
  });

  return (
    <div className="sec">
      <h2>Session Conclusions</h2>
      <div className="cd">
        <h4 style={{ color: C.green }}>What Happened</h4>
        <div style={{ font: '400 14px/1.9 DM Sans', color: 'var(--text)' }}>
          <p><strong>Duration:</strong> {session.duration} min, {ss.length} segments.</p>
          <p><strong>Mind state:</strong> {ep.toFixed(0)}% Ekāgra. {
            ss[0].dominant_chitta === 'Vikṣipta' ? 'Began oscillating.'
              : ss[0].dominant_chitta === 'Ekāgra' ? 'Entered Ekāgra immediately — strong carry-over.'
                : 'Opening was scattered.'
          }</p>
          <p><strong>Alpha:</strong> {session.bands.alpha.toFixed(3)}, peak {peakAlpha.toFixed(3)}. {
            session.bands.alpha > 0.3 ? 'Strong calm-awareness.'
              : session.bands.alpha > 0.15 ? 'Moderate awareness.' : 'Low alpha.'
          }</p>
          <p><strong>Heart rate:</strong> {session.hr_mean} bpm ({session.hr_min}–{session.hr_max}). {
            session.hr_mean < 65 ? 'Deep parasympathetic rest.'
              : session.hr_mean < 80 ? 'Calm.' : 'Elevated — effort present.'
          }</p>
          <p><strong>Effort:</strong> {ae.toFixed(3)}. {
            ae < 0.02 ? 'Effortless — Dhyāna.'
              : ae < 0.05 ? 'Near-effortless.'
                : ae < 0.15 ? 'Moderate — Dhāraṇā.' : 'High effort.'
          }</p>
          <p><strong>Blinks:</strong> {session.blink_rate}/min. {
            session.blink_rate < 2 ? 'Near-cessation.'
              : session.blink_rate < 5 ? 'Low — good withdrawal.'
                : session.blink_rate < 10 ? 'Moderate.' : 'Elevated.'
          }</p>
          <p><strong>Beta:</strong> {session.bands.beta.toFixed(3)}. {
            session.beta_neg_pct > 60 ? 'Sustained suppression.'
              : session.beta_neg_pct > 30 ? `Partial suppression (${session.beta_neg_pct}%).`
                : 'Analytical mind active.'
          }</p>
        </div>
      </div>

      <div className="cd">
        <h4 style={{ color: C.amber }}>Key Observations</h4>
        <div style={{ font: '400 13px/1.7 DM Sans' }}>
          {observations.length === 0
            ? <div className="ins">No strong-signal observations for this session.</div>
            : observations.map((o, i) => (
              <div key={i} className="ins" style={{ borderLeftColor: o.c }}>{o.t}</div>
            ))}
        </div>
      </div>

      <div className="cd">
        <h4 style={{ color: C.purple }}>Path Forward</h4>
        <div style={{ font: '400 14px/2 DM Sans', color: 'var(--text)' }}>
          <p><strong style={{ color: C.green }}>1.</strong> {ae > 0.1 ? 'Reduce effort → Śāmbhavopāya.' : 'Maintain this effortless approach.'}</p>
          <p><strong style={{ color: C.blue }}>2.</strong> {session.duration < 25 ? 'Extend to 30–45 min. Deep states emerge after min 25.' : 'Good duration.'}</p>
          <p><strong style={{ color: C.teal }}>3.</strong> {session.blink_rate > 5 ? 'Target blink cessation (<2/min).' : 'Blink control is good — observe if cessation windows extend.'}</p>
          <p><strong style={{ color: C.purple }}>4.</strong> {session.beta_neg_pct < 50 ? 'Beta suppression is the next frontier.' : 'Beta suppression progressing.'}</p>
          <p><strong style={{ color: C.pink }}>5.</strong> VBT dhāraṇā: rest in the gap between breaths.</p>
        </div>
      </div>
    </div>
  );
}
