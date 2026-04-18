import { Bar, Line, Radar } from 'react-chartjs-2';
import { C } from '../../scripts/constants.js';
import { segMean } from '../../scripts/metrics.js';
import { clamp } from '../../scripts/mathHelpers.js';
import { chartOptions } from '../common/ChartWrapper.jsx';
import InfoTip from '../common/InfoTip.jsx';
import KnowledgeCard from '../common/KnowledgeCard.jsx';
import FormulaBlock from '../common/FormulaBlock.jsx';
import { SAMKHYA_CARDS, SAMKHYA_REFERENCES } from '../../data/samkhya.js';

export default function SamkhyaTab({ session }) {
  const ss = session.segments;
  const ls = ss.map((s) => `Seg ${s.seg}`);

  const avgSat = segMean(ss, 'sattva');
  const avgRaj = segMean(ss, 'rajas');
  const avgTam = segMean(ss, 'tamas');
  const gt = avgSat + avgRaj + avgTam || 1;

  const buddhi = clamp(session.bands.alpha * 2 + Math.abs(Math.min(0, session.bands.beta)), 0, 1);
  const ahankara = clamp(Math.max(0, session.bands.beta) * 3 + (1 - session.beta_neg_pct / 100), 0, 1);
  const manas = clamp(session.blink_rate / 20 + (1 - session.gamma_neg_pct / 100), 0, 1);
  const pratyahara_mean = segMean(ss, 'pratyahara');
  const prakriti_quiet = clamp(1 - ahankara * 0.4 - manas * 0.3 - clamp(Math.max(0, session.bands.beta), 0, 1) * 0.3, 0, 1);

  return (
    <>
      <div className="sec">
        <h2>Sāṃkhya — Guṇa Dynamics</h2>
        <div className="cd">
          <div className="desc">
            Sāṃkhya identifies three qualities (guṇas) constituting Prakṛti. Sattva (clarity) = α dominance + stillness. Rajas (agitation) = β + motion + HR. Tamas (inertia) = δ dominance without clarity.
          </div>
          <div className="g3">
            <GunaCard name="Sattva" desc="Clarity, luminosity, balance" color={C.green} pct={avgSat / gt * 100} />
            <GunaCard name="Rajas" desc="Activity, restlessness, desire" color={C.red} pct={avgRaj / gt * 100} />
            <GunaCard name="Tamas" desc="Inertia, dullness, darkness" color="#8a857e" pct={avgTam / gt * 100} />
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3><InfoTip label="Guṇa Balance Over Time" tip="How sattva, rajas, and tamas shifted across segments." /></h3>
            <div className="cw tall">
              <Line
                data={{
                  labels: ls,
                  datasets: [
                    { label: 'Sattva', data: ss.map((s) => s.sattva), borderColor: C.green, backgroundColor: C.green + '15', fill: true, tension: 0.3 },
                    { label: 'Rajas', data: ss.map((s) => s.rajas), borderColor: C.red, fill: false, tension: 0.3 },
                    { label: 'Tamas', data: ss.map((s) => s.tamas), borderColor: '#8a857e', fill: false, tension: 0.3, borderDash: [4, 4] }
                  ]
                }}
                options={chartOptions('line')}
              />
            </div>
          </div>
          <div className="cd">
            <h3><InfoTip label="Buddhi Purity Index" tip="Sattva / total guṇas per segment. Higher = clearer discrimination." /></h3>
            <div className="cw tall">
              <Bar
                data={{
                  labels: ls,
                  datasets: [{
                    label: 'Buddhi Purity',
                    data: ss.map((s) => {
                      const tot = s.sattva + s.rajas + s.tamas;
                      return tot ? s.sattva / tot : 0;
                    }),
                    backgroundColor: ss.map((s) => {
                      const tot = s.sattva + s.rajas + s.tamas;
                      const p = tot ? s.sattva / tot : 0;
                      return p > 0.5 ? C.green + '90' : p > 0.35 ? C.amber + '90' : C.red + '90';
                    }),
                    borderRadius: 4
                  }]
                }}
                options={chartOptions('bar', { scales: { y: { max: 1 } } })}
              />
            </div>
          </div>
        </div>

        <div className="cd">
          <h3>Segment Guṇa Breakdown</h3>
          <table className="sgt">
            <thead>
              <tr><th>Seg</th><th>Sattva</th><th>Rajas</th><th>Tamas</th><th>Dominant</th><th>α</th><th>β</th><th>Motion</th></tr>
            </thead>
            <tbody>
              {ss.map((s) => {
                const tot = s.sattva + s.rajas + s.tamas || 1;
                const dom = s.sattva >= s.rajas && s.sattva >= s.tamas ? 'Sattva'
                  : s.rajas >= s.tamas ? 'Rajas' : 'Tamas';
                const dc = dom === 'Sattva' ? C.green : dom === 'Rajas' ? C.red : '#8a857e';
                return (
                  <tr key={s.seg}>
                    <td>{s.seg}</td>
                    <td style={{ color: C.green }}>{(s.sattva / tot * 100).toFixed(0)}%</td>
                    <td style={{ color: C.red }}>{(s.rajas / tot * 100).toFixed(0)}%</td>
                    <td>{(s.tamas / tot * 100).toFixed(0)}%</td>
                    <td><span className="pill" style={{ background: dc + '18', color: dc }}>{dom}</span></td>
                    <td>{s.alpha.toFixed(3)}</td>
                    <td>{s.beta.toFixed(3)}</td>
                    <td>{s.gyro_avg.toFixed(1)}°/s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cd">
          <h4 style={{ color: C.purple }}>Puruṣa–Prakṛti Framework</h4>
          <div className="desc">
            EEG measures Prakṛti’s modifications. Puruṣa (pure awareness) is unmeasurable. As sattva rises, buddhi purifies and Puruṣa’s reflection becomes clearer.
          </div>
          <div className="g2">
            <div>
              <div className="pp-stack">
                <PPRow icon="\u2727" name="Puruṣa" sub="Pure consciousness — the witness. Not measurable, inferred from Prakṛti quieting." color={C.purple} val="∞" note="Beyond EEG" bg="linear-gradient(90deg,#f0eaf8,#faf8f4)" />
                <PPRow icon="\u25c9" name="Buddhi" sub="Discriminative intelligence. α coherence + β suppression." color={C.blue} val={buddhi.toFixed(2)} bar={buddhi * 100} />
                <PPRow icon="\u25ce" name="Ahaṃkāra" sub="Ego-sense. Measured by β activity." color={C.amber} val={ahankara.toFixed(2)} bar={ahankara * 100} />
                <PPRow icon="\u25cb" name="Manas" sub="Sensory mind. Blink rate + γ processing." color={C.teal} val={manas.toFixed(2)} bar={manas * 100} />
                <PPRow icon="\u25e6" name="5 Jñānendriyas + 5 Tanmātras" sub="Sense organs and subtle elements. Pratyāhāra score indicates withdrawal." color="var(--dim)" val={pratyahara_mean.toFixed(2)} bar={pratyahara_mean * 100} bg="#faf8f4" />
              </div>
            </div>
            <div>
              <div className="cd" style={{ background: '#faf8f4', textAlign: 'center', padding: 24 }}>
                <h3>Prakṛti Quieting</h3>
                <div className="desc">How still is the mind-field? Higher = clearer reflection of Puruṣa.</div>
                <div style={{ font: '600 42px JetBrains Mono', color: C.purple, margin: '14px 0' }}>
                  {(prakriti_quiet * 100).toFixed(0)}<span style={{ fontSize: 16, color: 'var(--dim)' }}>%</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#e8e5de', overflow: 'hidden' }}>
                  <div style={{ width: `${prakriti_quiet * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg,${C.blue},${C.purple})` }} />
                </div>
                <div style={{ font: '400 11px DM Sans', color: 'var(--dim)', marginTop: 10 }}>
                  β negative: {session.beta_neg_pct}% • γ negative: {session.gamma_neg_pct}%
                </div>
              </div>
              <div className="cd" style={{ background: '#faf8f4' }}>
                <h3>Tattva Radar</h3>
                <div className="cw short">
                  <Radar
                    data={{
                      labels: ['Buddhi', 'Sattva', 'Pratyāhāra', 'Stillness', 'Ahaṃkāra⁻', 'Manas⁻'],
                      datasets: [{
                        label: 'Inner Instruments',
                        data: [
                          buddhi,
                          segMean(ss, 'sattva'),
                          pratyahara_mean,
                          ss.reduce((a, s) => a + clamp(1 - s.gyro_avg / 10, 0, 1), 0) / ss.length,
                          1 - ahankara,
                          1 - manas
                        ],
                        borderColor: C.purple,
                        backgroundColor: C.purple + '20',
                        pointBackgroundColor: C.purple
                      }]
                    }}
                    options={chartOptions('radar')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec">
        <h2>Metrics Library — Sāṃkhya</h2>
        <div className="kgrid">
          {SAMKHYA_CARDS.map((card) => (
            <KnowledgeCard key={card.title} {...card}>
              {card.formula ? <FormulaBlock>{card.formula}</FormulaBlock> : null}
            </KnowledgeCard>
          ))}
        </div>
        <div className="cd">
          <h3>Research References</h3>
          <ol style={{ paddingLeft: 20, font: '400 12px/1.9 DM Sans', color: 'var(--dim)' }}>
            {SAMKHYA_REFERENCES.map((r) => <li key={r}>{r}</li>)}
          </ol>
        </div>
      </div>
    </>
  );
}

function GunaCard({ name, desc, color, pct }) {
  return (
    <div className="gc" style={{ borderColor: color }}>
      <div className="gn" style={{ color }}>{name}</div>
      <div className="gd">{desc}</div>
      <div className="gv" style={{ color }}>{pct.toFixed(0)}%</div>
      <div className="gb"><div style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function PPRow({ icon, name, sub, color, val, note, bar, bg }) {
  return (
    <div className="pp-row" style={bg ? { background: bg } : undefined}>
      <div className="pp-icon" style={{ background: (color === 'var(--dim)' ? '#eae7e1' : color + '15'), color }}>{icon}</div>
      <div className="pp-info">
        <div className="pp-name" style={{ color }}>{name}</div>
        <div className="pp-sub">{sub}</div>
      </div>
      <div className="pp-val">
        <div className="pp-num" style={{ color }}>{val}</div>
        {note ? <div style={{ font: '300 10px DM Sans', color: 'var(--dim)' }}>{note}</div>
          : <div className="pp-bar"><div style={{ width: `${bar}%`, background: color }} /></div>}
      </div>
    </div>
  );
}
