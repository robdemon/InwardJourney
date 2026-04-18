import TraditionTab from './TraditionTab.jsx';
import { BUDDHISM_CARDS, BUDDHISM_REFERENCES } from '../../data/buddhism.js';

export default function BuddhismTab({ session }) {
  return (
    <TraditionTab
      title="Buddhism — Contemplative Neuroscience"
      blurb="Buddhism has the deepest EEG research base of any contemplative tradition. Shamatha, Vipassana, Zen, Tibetan/Vajrayana, Metta, Chan and Jhāna each produce distinct, measurable signatures across 100+ peer-reviewed studies."
      cards={BUDDHISM_CARDS}
      references={BUDDHISM_REFERENCES}
      session={session}
    />
  );
}
