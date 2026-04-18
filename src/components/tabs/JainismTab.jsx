import TraditionTab from './TraditionTab.jsx';
import { JAINISM_CARDS, JAINISM_REFERENCES } from '../../data/jainism.js';

export default function JainismTab({ session }) {
  return (
    <TraditionTab
      title="Jainism — Prekṣā Dhyāna & Kāyotsarga"
      blurb="Jainism’s growing EEG literature centres on Prekṣā Dhyāna, revived by Acharya Mahāprajña. AIIMS Delhi and Jain Vishva Bharti have tracked multi-month α trajectories; Kāyotsarga uniquely combines IMU stillness with parasympathetic HRV."
      cards={JAINISM_CARDS}
      references={JAINISM_REFERENCES}
      session={session}
    />
  );
}
