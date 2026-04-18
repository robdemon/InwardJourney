import TraditionTab from './TraditionTab.jsx';
import { TAOISM_CARDS, TAOISM_REFERENCES } from '../../data/taoism.js';

export default function TaoismTab({ session }) {
  return (
    <TraditionTab
      title="Taoism — Qigong, Tài Chí & Three Treasures"
      blurb="Taoism has strong empirical support via Qigong and Tài Chí. A 2024 meta-analysis of 148 HRV studies confirmed significant SDNN and HF-power gains. Muse S Athena uniquely captures moving meditation — EEG + IMU + fNIRS + PPG — in a single session."
      cards={TAOISM_CARDS}
      references={TAOISM_REFERENCES}
      session={session}
    />
  );
}
