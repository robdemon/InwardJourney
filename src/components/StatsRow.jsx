import { C } from '../scripts/constants.js';
import { segMean } from '../scripts/metrics.js';
import InfoTip from './common/InfoTip.jsx';

export default function StatsRow({ session }) {
  const segs = session.segments;
  const avgMDS = segMean(segs, 'mds');
  const avgEff = segMean(segs, 'effort');

  const depth = avgMDS > 0.6 ? 'Deep' : avgMDS > 0.4 ? 'Moderate' : 'Light';
  const depthCol = avgMDS > 0.6 ? C.green : avgMDS > 0.4 ? C.amber : C.red;
  const effLabel = avgEff < 0.02 ? 'Flow' : avgEff < 0.05 ? 'Gentle' : avgEff < 0.15 ? 'Effort' : 'Strain';
  const effCol = avgEff < 0.05 ? C.green : avgEff < 0.15 ? C.amber : C.red;

  const blDesc =
    session.blink_rate < 2 ? 'Near cessation ✓'
    : session.blink_rate < 5 ? 'Low — good withdrawal'
    : session.blink_rate < 10 ? 'Moderate'
    : session.blink_rate < 15 ? 'Elevated'
    : 'High — senses active';

  return (
    <div className="sr">
      <Tile color={C.teal} value={session.duration} unit="m"
        label={<InfoTip label="Duration" tip="Total length of the meditation session recording." />} />
      <Tile color={C.green} value={session.bands.alpha.toFixed(3)}
        label={<InfoTip label="Alpha Power" tip="Average α band (8–12 Hz). Higher = stronger calm, relaxed awareness." />} />
      <Tile color={C.pink} value={session.hr_mean}
        label={<InfoTip label="Heart Rate" tip={`Average BPM. Lower = parasympathetic dominance. Range: ${session.hr_min}–${session.hr_max}.`} />} />
      <Tile color={C.amber} value={session.blink_rate} unit="/m" desc={blDesc}
        label={<InfoTip label="Blinks" tip="Blinks per minute. Lower = deeper sensory withdrawal." />} />
      <Tile color={depthCol} value={depth} desc={`MDS: ${avgMDS.toFixed(2)}`}
        label={<InfoTip label="Depth" tip="MDS composite: α, stability, stillness, β suppression, blinks, HR." />} />
      <Tile color={effCol} value={effLabel} desc={avgEff < 0.05 ? 'Dhyāna mode' : 'Dhāraṇā mode'}
        label={<InfoTip label="Effort" tip="HR elevation from baseline. Near zero = Dhyāna. High = Dhāraṇā." />} />
    </div>
  );
}

function Tile({ color, value, unit, label, desc }) {
  return (
    <div className="st">
      <div className="v" style={{ color }}>
        {value}
        {unit ? <span style={{ fontSize: 12 }}>{unit}</span> : null}
      </div>
      <div className="l">{label}</div>
      {desc ? <div className="desc">{desc}</div> : null}
    </div>
  );
}
