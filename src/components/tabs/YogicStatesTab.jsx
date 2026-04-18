import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { C, CHITTA_COLORS } from '../../scripts/constants.js';
import { segMean } from '../../scripts/metrics.js';
import { clamp } from '../../scripts/mathHelpers.js';
import { chartOptions } from '../common/ChartWrapper.jsx';
import InfoTip from '../common/InfoTip.jsx';

export default function YogicStatesTab({ session }) {
  const ss = session.segments;
  const ls = ss.map((s) => `Seg ${s.seg}`);

  const chittaCounts = {};
  for (const s of ss) chittaCounts[s.dominant_chitta] = (chittaCounts[s.dominant_chitta] || 0) + 1;

  const radarVals = {
    a: segMean(ss, 'alpha'),
    st: ss.reduce((a, s) => a + clamp(1 - s.cv_alpha, 0, 1), 0) / ss.length,
    sl: ss.reduce((a, s) => a + clamp(1 - s.gyro_avg / 10, 0, 1), 0) / ss.length,
    pr: segMean(ss, 'pratyahara'),
    ek: segMean(ss, 'ekagra'),
    ef: ss.reduce((a, s) => a + clamp(1 - s.effort * 4, 0, 1), 0) / ss.length
  };

  return (
    <>
      <div className="sec">
        <h2>Chitta Bhūmis — States of Mind</h2>
        <div className="cd">
          <div className="desc">
            The five states of citta from Vyāsa’s commentary on YS 1.1. Kṣipta = scattered, Vikṣipta = oscillating, Ekāgra = one-pointed, Niruddha = mastered.
          </div>
          <div className="g2">
            <div>
              <h3><InfoTip label="State Scores" tip="Stacked scores for each chitta bhūmi per segment." /></h3>
              <div className="cw">
                <Bar
                  data={{
                    labels: ls,
                    datasets: [
                      { label: 'Kṣipta', data: ss.map((s) => s.kshipta), backgroundColor: C.red + '80' },
                      { label: 'Vikṣipta', data: ss.map((s) => s.vikshipta), backgroundColor: C.amber + '80' },
                      { label: 'Ekāgra', data: ss.map((s) => s.ekagra), backgroundColor: C.green + '80' },
                      { label: 'Niruddha', data: ss.map((s) => s.niruddha), backgroundColor: C.purple + '80' }
                    ]
                  }}
                  options={chartOptions('bar', { scales: { x: { stacked: true }, y: { stacked: true, max: 1.5 } } })}
                />
              </div>
            </div>
            <div>
              <h3><InfoTip label="Time in Each State" tip="Proportion of session in each chitta state." /></h3>
              <div className="cw">
                <Doughnut
                  data={{
                    labels: Object.keys(chittaCounts),
                    datasets: [{
                      data: Object.values(chittaCounts),
                      backgroundColor: Object.keys(chittaCounts).map((k) => CHITTA_COLORS[k] || '#888'),
                      borderWidth: 2,
                      borderColor: '#ffffff'
                    }]
                  }}
                  options={chartOptions('doughnut')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="cd">
          <h3><InfoTip label="Session Journey" tip="Each row is a ~5 min window showing dominant state, scores, and vitals." /></h3>
          <table className="sgt">
            <thead>
              <tr>
                <th>Seg</th><th>Time</th><th>State</th>
                <th><InfoTip label="Ekāgra" tip="One-pointedness score." /></th>
                <th><InfoTip label="MDS" tip="Meditation Depth Score." /></th>
                <th><InfoTip label="Effort" tip="HR elevation from baseline." /></th>
                <th>Blinks</th><th>HR</th>
              </tr>
            </thead>
            <tbody>
              {ss.map((s) => {
                const c = CHITTA_COLORS[s.dominant_chitta] || '#888';
                return (
                  <tr key={s.seg}>
                    <td>{s.seg}</td>
                    <td>{s.start}–{s.end}m</td>
                    <td><span className="pill" style={{ background: c + '18', color: c }}>{s.dominant_chitta}</span></td>
                    <td>{s.ekagra.toFixed(2)}</td>
                    <td>{s.mds.toFixed(2)}</td>
                    <td>{s.effort < 0.02 ? '\u2713' : s.effort.toFixed(2)}</td>
                    <td>{s.blink_rate.toFixed(1)}/m</td>
                    <td>{s.hr_avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec">
        <h2>Aṣṭāṅga — Inner Limbs</h2>
        <div className="cd">
          <div className="desc">
            Pratyāhāra (sense withdrawal) → Dhāraṇā (effortful focus) → Dhyāna (effortless flow). Effort index separates the last two.
          </div>
          <div className="g2">
            <div>
              <h3><InfoTip label="Limb Activation" tip="Scores for inner yoga limbs 5–8." /></h3>
              <div className="cw">
                <Bar
                  data={{
                    labels: ls,
                    datasets: [
                      { label: 'Pratyāhāra', data: ss.map((s) => s.pratyahara), backgroundColor: C.teal + '80' },
                      { label: 'Dhāraṇā', data: ss.map((s) => s.dharana), backgroundColor: C.blue + '80' },
                      { label: 'Dhyāna', data: ss.map((s) => s.dhyana), backgroundColor: C.green + '80' },
                      { label: 'Savitarka', data: ss.map((s) => s.savitarka), backgroundColor: C.purple + '80' }
                    ]
                  }}
                  options={chartOptions('bar')}
                />
              </div>
            </div>
            <div>
              <h3><InfoTip label="Effort vs Ekāgra" tip="High Ekāgra with near-zero effort = Dhyāna." /></h3>
              <div className="cw">
                <Line
                  data={{
                    labels: ls,
                    datasets: [
                      { label: 'Effort', data: ss.map((s) => s.effort), borderColor: C.amber, backgroundColor: C.amber + '15', fill: true, tension: 0.3 },
                      { label: 'Ekāgra', data: ss.map((s) => s.ekagra), borderColor: C.green, fill: false, tension: 0.3 }
                    ]
                  }}
                  options={chartOptions('line')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sec">
        <h2>Composite Metrics</h2>
        <div className="g3">
          <div className="cd">
            <h3><InfoTip label="Meditation Depth" tip="MDS: 0–1 composite score." /></h3>
            <div className="cw">
              <Bar
                data={{
                  labels: ls,
                  datasets: [{
                    label: 'MDS',
                    data: ss.map((s) => s.mds),
                    backgroundColor: ss.map((s) => s.mds > 0.6 ? C.green + '90' : s.mds > 0.4 ? C.amber + '90' : C.red + '90'),
                    borderRadius: 4
                  }]
                }}
                options={chartOptions('bar', { scales: { y: { max: 1 } } })}
              />
            </div>
          </div>
          <div className="cd">
            <h3><InfoTip label="Brainwave Bands" tip="Average δ, θ, α, β, γ per segment." /></h3>
            <div className="cw">
              <Bar
                data={{
                  labels: ls,
                  datasets: [
                    { label: 'δ', data: ss.map((s) => s.delta), backgroundColor: '#7048b880' },
                    { label: 'θ', data: ss.map((s) => s.theta), backgroundColor: C.teal + '80' },
                    { label: 'α', data: ss.map((s) => s.alpha), backgroundColor: C.green + '80' },
                    { label: 'β', data: ss.map((s) => s.beta), backgroundColor: C.amber + '80' },
                    { label: 'γ', data: ss.map((s) => s.gamma), backgroundColor: C.red + '80' }
                  ]
                }}
                options={chartOptions('bar')}
              />
            </div>
          </div>
          <div className="cd">
            <h3><InfoTip label="Session Profile" tip="Six key dimensions of meditation quality." /></h3>
            <div className="cw">
              <Radar
                data={{
                  labels: ['Alpha', 'Stability', 'Stillness', 'Pratyāhāra', 'Ekāgra', 'Effortless'],
                  datasets: [{
                    label: 'Session',
                    data: Object.values(radarVals),
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
    </>
  );
}
