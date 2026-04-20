import { Bar, Line } from 'react-chartjs-2';
import { C } from '../../scripts/constants.js';
import { segMean } from '../../scripts/metrics.js';
import { chartOptions } from '../common/ChartWrapper.jsx';
import InfoTip from '../common/InfoTip.jsx';
import KnowledgeCard from '../common/KnowledgeCard.jsx';
import FormulaBlock from '../common/FormulaBlock.jsx';
import { PATANJALI_CARDS, PATANJALI_REFERENCES } from '../../data/patanjali.js';

const LIMBS = ['Yama', 'Niyama', 'Āsana', 'Prāṇāyāma', 'Pratyāhāra', 'Dhāraṇā', 'Dhyāna', 'Samādhi'];

export default function PatanjaliTab({ session }) {
  const ss = session.segments;
  const ls = ss.map((s) => `Seg ${s.seg}`);
  const avgEff = segMean(ss, 'effort');
  const dhyanaCount = ss.filter((s) => s.dhyana > 0.3).length;
  const hasDhy = dhyanaCount > 0;
  const dhyanaPct = ((dhyanaCount / ss.length) * 100).toFixed(0);

  return (
    <>
      <div className="sec">
        <h2>Patañjali Yoga Sūtra Analysis</h2>
        <div className="cd">
          <h4 style={{ color: C.green }}>YS 1.2: citta-vṛtti-nirodhaḥ</h4>
          <div className="desc">Yoga = cessation of mental fluctuations. α stability reflects reduced vṛtti activity.</div>
          <div className="g2">
            <div>
              <h3><InfoTip label="Vṛtti Activity" tip="α% = calm-awareness share. CV×100 = instability — lower = steadier mind." /></h3>
              <div className="cw">
                <Bar
                  data={{
                    labels: ls,
                    datasets: [
                      { label: 'Alpha %', data: ss.map((s) => s.alpha_pct), backgroundColor: C.green + '80', borderRadius: 4 },
                      { label: 'Instability (CV×100)', data: ss.map((s) => s.cv_alpha * 100), backgroundColor: C.amber + '40', borderRadius: 4 }
                    ]
                  }}
                  options={chartOptions('bar', { scales: { y: { max: 100 } } })}
                />
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <h3 style={{ font: '500 11px JetBrains Mono', color: 'var(--dim)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
                Five Vṛttis in EEG
              </h3>
              <div style={{ font: '400 13px/2.2 DM Sans', color: 'var(--text)' }}>
                <div><span style={{ color: C.blue }}>● Pramāṇa</span> (valid knowing) → β frontal</div>
                <div><span style={{ color: C.amber }}>● Viparyaya</span> (error) → β + unstable α</div>
                <div><span style={{ color: C.purple }}>● Vikalpa</span> (verbal) → βγ coupling</div>
                <div><span style={{ color: '#8a857e' }}>● Nidrā</span> (sleep) → δ dominance</div>
                <div><span style={{ color: C.pink }}>● Smṛti</span> (memory) → θ activity</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cd">
          <h4>Eight Limbs Position</h4>
          <div className="desc">EEG places you on the inner limbs (5–8). Completed limbs shown with ✓.</div>
          <div style={{ display: 'flex', gap: 4, margin: '14px 0' }}>
            {LIMBS.map((l, i) => {
              const done = i < 5;
              const current = i === 5;
              const emerging = i === 6;
              const bg = current ? C.green + '20' : emerging ? C.purple + '15' : done ? C.green + '10' : '#eae7e1';
              const col = current ? C.green : emerging ? C.purple : done ? C.green : '#8a857e';
              const border = current ? `2px solid ${C.green}` : emerging ? `1px dashed ${C.purple}` : '1px solid transparent';
              return (
                <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border, font: '600 10px JetBrains Mono', color: col }}>
                    {done && !current ? '\u2713' : i + 1}
                  </div>
                  <div style={{ font: '400 9px DM Sans', marginTop: 5, color: col }}>{l}</div>
                </div>
              );
            })}
          </div>
          <div className="ins" style={{ borderLeftColor: C.green }}>
            Primary limb: <strong>{avgEff < 0.05 ? 'Dhyāna' : 'Dhāraṇā'}</strong> — avg HR effort {(avgEff * 100).toFixed(0)}%.{' '}
            {hasDhy
              ? <><strong style={{ color: C.purple }}>Dhyāna</strong> present in {dhyanaPct}% of segments ({dhyanaCount}/{ss.length}).</>
              : 'Dhyāna not yet stable this session.'}
          </div>
        </div>

        <div className="cd">
          <h3><InfoTip label="Samyama Progression" tip="Dhāraṇā, Dhyāna, Samādhi uniting on one object = samyama." /></h3>
          <div className="cw">
            <Line
              data={{
                labels: ls,
                datasets: [
                  { label: 'Dhāraṇā', data: ss.map((s) => s.dharana), borderColor: C.blue, tension: 0.3 },
                  { label: 'Dhyāna', data: ss.map((s) => s.dhyana), borderColor: C.green, tension: 0.3 },
                  { label: 'Savitarka', data: ss.map((s) => s.savitarka), borderColor: C.purple, tension: 0.3 },
                  { label: 'Pratyāhāra', data: ss.map((s) => s.pratyahara), borderColor: C.teal, borderDash: [5, 5], tension: 0.3 }
                ]
              }}
              options={chartOptions('line')}
            />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, font: '400 11px DM Sans', color: 'var(--dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#888" strokeWidth="2" /></svg>
              <strong>Solid line</strong> — inner limb (Dhāraṇā, Dhyāna, Savitarka): directly measurable from EEG
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#888" strokeWidth="2" strokeDasharray="5,4" /></svg>
              <strong>Dotted line</strong> — Pratyāhāra: transitional limb bridging outer practice and inner absorption
            </span>
          </div>
        </div>
      </div>

      <div className="sec">
        <h2>Metrics Library — Yoga Sūtras · Aṣṭāṅga · Hatha</h2>
        <div className="kgrid">
          {PATANJALI_CARDS.map((card) => {
            const { compute, formula, ...rest } = card;
            const derived = compute ? compute(session) : {};
            return (
              <KnowledgeCard key={card.title} {...rest} {...derived}>
                {formula ? <FormulaBlock>{formula}</FormulaBlock> : null}
              </KnowledgeCard>
            );
          })}
        </div>
        <div className="cd">
          <h3>Research References (selected)</h3>
          <ol style={{ paddingLeft: 20, font: '400 12px/1.9 DM Sans', color: 'var(--dim)' }}>
            {PATANJALI_REFERENCES.map((r) => <li key={r}>{r}</li>)}
          </ol>
        </div>
      </div>
    </>
  );
}
