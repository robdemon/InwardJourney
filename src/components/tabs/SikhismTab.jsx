import TraditionTab from './TraditionTab.jsx';
import { SIKHISM_CARDS, SIKHISM_REFERENCES } from '../../data/sikhism.js';

export default function SikhismTab({ session }) {
  return (
    <TraditionTab
      title="Sikhism — Nām Simran & Kīrtan"
      blurb="No studies are explicitly labelled ‘Sikhism’, but Kīrtan Kriyā (Kundalini-yoga-rooted) has been validated on Muse EEG (Frontiers 2023, n=40). Nām Simran maps to the mantra EEG literature and Gurbāṇī Kīrtan to religious-chanting neuroscience."
      cards={SIKHISM_CARDS}
      references={SIKHISM_REFERENCES}
      session={session}
    />
  );
}
