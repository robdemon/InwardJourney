import { Bar } from 'react-chartjs-2';
import { C } from '../../scripts/constants.js';
import { chartOptions } from '../common/ChartWrapper.jsx';
import InfoTip from '../common/InfoTip.jsx';
import KnowledgeCard from '../common/KnowledgeCard.jsx';
import FormulaBlock from '../common/FormulaBlock.jsx';
import { KASHMIR_CARDS, KASHMIR_REFERENCES } from '../../data/kashmir.js';

const UPAYAS = [
  { n: 'Āṇavopāya', s: 'Individual effort', c: C.amber, d: 'Body-level: breath, posture, kriya. EEG: settling phase, high motion → low.' },
  { n: 'Śāktopāya', s: 'Energy / Mind', c: C.blue, d: 'Mind-level: mantra, contemplation. EEG: Dhāraṇā with effort, α rising + elevated HR.' },
  { n: 'Śāmbhavopāya', s: 'Consciousness / Will', c: C.green, d: 'Recognition through will alone. EEG: Dhyāna, effortless α, zero effort index.' },
  { n: 'Anupāya', s: 'Grace / No-path', c: C.purple, d: 'Spontaneous recognition. Beyond measurement — the mirror cannot reflect itself.' }
];

export default function KashmirTab({ session }) {
  const ss = session.segments;
  const ls = ss.map((s) => `Seg ${s.seg}`);
  const avgSpanda = ss.reduce((a, s) => a + s.cv_alpha * Math.max(0, s.theta), 0) / ss.length;
  const upa = ss.map((s) => ({
    a: Math.max(0, 1 - s.pratyahara) * 0.5 + s.gyro_avg / 20,
    sh: s.effort * s.ekagra,
    sm: s.dhyana * Math.max(0, 1 - s.effort * 2)
  }));

  const kancukas = [
    { n: 'Kalā', s: 'Limited agency', v: session.bands.beta.toFixed(3), c: C.amber, band: 'β' },
    { n: 'Vidyā', s: 'Limited knowing', v: session.bands.gamma.toFixed(3), c: C.pink, band: 'γ' },
    { n: 'Rāga', s: 'Attachment', v: `${(session.hr_max - session.hr_min).toFixed(0)} bpm`, c: C.red, band: 'HR var' },
    { n: 'Kāla', s: 'Time', v: session.bands.alpha.toFixed(3), c: C.green, band: 'α' },
    { n: 'Niyati', s: 'Space', v: ss[0].fai.toFixed(2), c: C.blue, band: 'FAI' }
  ];

  return (
    <>
      <div className="sec">
        <h2>Kashmir Śaivism</h2>
        <div className="cd">
          <h4 style={{ color: C.pink }}>Four Upāyas</h4>
          <div className="desc">Four paths of recognition from most effortful to spontaneous. EEG reveals which upāya is active.</div>
          <div className="g2">
            <div>
              {UPAYAS.map((u) => (
                <div key={u.n} style={{ padding: 14, background: '#faf8f4', borderRadius: 10, borderLeft: `4px solid ${u.c}`, marginBottom: 10 }}>
                  <div style={{ font: '600 14px DM Sans', color: u.c }}>{u.n}</div>
                  <div style={{ font: '400 11px DM Sans', color: 'var(--dim)' }}>{u.s}</div>
                  <div style={{ font: '400 12px/1.6 DM Sans', color: 'var(--text)', marginTop: 6 }}>{u.d}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="cd" style={{ background: '#faf8f4' }}>
                <h3><InfoTip label="Upāya Distribution" tip="Which path dominated each segment." /></h3>
                <div className="cw">
                  <Bar
                    data={{
                      labels: ls,
                      datasets: [
                        { label: 'Āṇava', data: upa.map((u) => u.a), backgroundColor: C.amber + '80' },
                        { label: 'Śākta', data: upa.map((u) => u.sh), backgroundColor: C.blue + '80' },
                        { label: 'Śāmbhava', data: upa.map((u) => u.sm), backgroundColor: C.green + '80' }
                      ]
                    }}
                    options={chartOptions('bar', { scales: { x: { stacked: true }, y: { stacked: true } } })}
                  />
                </div>
              </div>
              <div className="cd" style={{ background: '#faf8f4' }}>
                <h3><InfoTip label="Spanda Index" tip="CV(α) × θ. The vibration of consciousness." /></h3>
                <div style={{ font: '600 26px JetBrains Mono', color: C.teal, margin: '10px 0' }}>{avgSpanda.toFixed(4)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cd">
          <h4 style={{ color: C.teal }}>5 Kañcukas → EEG</h4>
          <div className="desc">Māyā’s five coverings that limit infinite consciousness, mapped to EEG dimensions.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 14 }}>
            {kancukas.map((k) => (
              <div key={k.n} style={{ padding: 12, background: '#faf8f4', borderRadius: 10, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ font: '600 12px DM Sans', color: k.c }}>{k.n}</div>
                <div style={{ font: '400 10px DM Sans', color: 'var(--dim)' }}>{k.s}</div>
                <div style={{ font: '600 16px JetBrains Mono', color: k.c, marginTop: 8 }}>{k.v}</div>
                <div style={{ font: '400 10px JetBrains Mono', color: 'var(--dim)' }}>{k.band}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sec">
        <h2>Metrics Library — Kashmir Śaivism</h2>
        <div className="kgrid">
          {KASHMIR_CARDS.map((card) => {
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
          <h3>Research References</h3>
          <ol style={{ paddingLeft: 20, font: '400 12px/1.9 DM Sans', color: 'var(--dim)' }}>
            {KASHMIR_REFERENCES.map((r) => <li key={r}>{r}</li>)}
          </ol>
        </div>
      </div>
    </>
  );
}
