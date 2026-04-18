import { clamp } from '../scripts/mathHelpers.js';

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

const NA = { value: '—', valueLabel: 'not derivable from this CSV' };

export const BUDDHISM_CARDS = [
  {
    title: 'Shamatha — Focused attention',
    subtitle: 'θ + α + β composite',
    body: 'Concentrative meditation: all three bands rise vs baseline during deep Shamatha. Advanced practitioners add posterior γ.',
    formula: 'SDI = 0.35·θ% + 0.35·α% + 0.30·β%\n0–30: early settling · 30–55: focused · 55–75: Shamatha emerging · >75: deep absorption',
    reference: 'Frontiers Psychology (2024) — Tibetan Sera-Jey Monastery EEG, n=23 monks.',
    badge: { kind: 'computed', text: 'Computable now' },
    accent: '#2a8c5a',
    compute: (s) => {
      const b = s.bands;
      const tot = Math.abs(b.alpha) + Math.abs(b.beta) + Math.abs(b.theta) + Math.abs(b.delta) + Math.abs(b.gamma) || 1;
      const sdi = clamp(0.35 * Math.abs(b.theta) / tot + 0.35 * Math.abs(b.alpha) / tot + 0.30 * Math.max(0, b.beta) / tot, 0, 1) * 100;
      const phase = sdi > 75 ? 'deep absorption' : sdi > 55 ? 'Shamatha emerging' : sdi > 30 ? 'focused' : 'early settling';
      return { value: sdi.toFixed(0), valueLabel: 'SDI (0–100)', interpretation: phase };
    }
  },
  {
    title: 'Vipassana Trait Index',
    subtitle: 'α as persistent trait',
    body: 'Experienced Vipassana practitioners show high α during *both* meditation and mind-wandering — a true trait effect rather than a state.',
    formula: 'VTI = α(mind-wandering) / α(meditation)\nTrait: VTI > 0.85',
    reference: 'PLOS One (2017, n=64) — three traditions EEG.',
    badge: { kind: 'reference', text: 'Needs labelled tasks' },
    accent: '#3672b8',
    compute: () => NA
  },
  {
    title: 'Zen / Zazen',
    subtitle: 'Just sitting',
    body: 'Short sessions: θ deepening, α arousal control. Long sessions (1.5 h): β + θ ↑, α ↓ toward end. 25-year practitioners show a unique sustained profile.',
    reference: 'ScienceDirect (2025) — in-monastery wearable EEG.',
    badge: { kind: 'computed', text: 'θ + α this session' },
    accent: '#7048b8',
    compute: (s) => {
      const kind = s.duration < 30 ? 'short' : s.duration < 60 ? 'standard' : 'long';
      return { value: fmt(s.bands.theta + s.bands.alpha, 3), valueLabel: `${kind} session θ+α`, interpretation: `${s.duration}m` };
    }
  },
  {
    title: 'Tibetan / Vajrayana',
    subtitle: 'Deity, mantra, rig-pa',
    body: 'Distinct from α-dominant traditions: decreased HF HRV and β, high-frequency cortical synchrony (β-γ) in prefrontal, parietal, occipital regions.',
    reference: 'Neuroscience & Biobehavioral Reviews (2025). PMC (2020) Tibetan monk review.',
    badge: { kind: 'reference', text: 'Needs HRV spectrum' },
    accent: '#c8850a',
    compute: () => NA
  },
  {
    title: 'Jhāna — Complexity rises',
    subtitle: 'Broadband power drops',
    body: 'Absorption produces falling broadband EEG power *with* rising Lempel–Ziv complexity — opposite of sleep or anaesthesia. Plus nucleus-accumbens activation on fMRI.',
    formula: 'JCS = LZC_session / LZC_resting\nJCS > 1.2 → entering · > 1.5 → deep jhāna',
    reference: 'ScienceDirect (2024) — 23 000-hr practitioner, 7T fMRI+EEG. PMC 2013 — NAc activation.',
    badge: { kind: 'reference', text: 'Raw EEG required' },
    accent: '#c04a8a',
    compute: () => NA
  },
  {
    title: 'Cessation — Theravāda',
    subtitle: '37 captured events',
    body: 'Pre-event α slope < −0.02 for 40 s, then global γ synchronisation at cessation. Eye-blink artefact at transition onset.',
    reference: 'Brain Topography (2024, Harvard, van Lutterveld) — 37 cessation events in a single adept (6000+ retreat hrs).',
    badge: { kind: 'reference', text: 'Adept-level practice' },
    accent: '#dc4a3a',
    compute: () => NA
  },
  {
    title: 'Metta — Loving-kindness',
    subtitle: 'Frontal alpha asymmetry',
    body: 'Frontal α asymmetry (left > right prefrontal α), γ in experienced practitioners, θ as emotional-processing marker.',
    formula: 'FAA = ln(AF8_α) − ln(AF7_α)\nPositive FAA = approach motivation',
    reference: 'PNAS 2011 (Brewer) — DMN deactivation in compassion meditation.',
    badge: { kind: 'computed', text: 'FAA from AF7/AF8' },
    accent: '#1a8a8a',
    compute: (s) => {
      const af7 = Math.max(1e-4, s.bands.alpha_af7);
      const af8 = Math.max(1e-4, s.bands.alpha_af8);
      const faa = Math.log(af8) - Math.log(af7);
      return { value: fmt(faa, 3), valueLabel: 'FAA', interpretation: faa > 0 ? 'approach / positive affect' : 'withdrawal' };
    }
  }
];

export const BUDDHISM_REFERENCES = [
  'Frontiers Psychology (2024) — Sera-Jey Monastery, n=23.',
  'ScienceDirect (2025) — Zen monastery wearable EEG.',
  'Brain Topography (2024) — Cessation PLI network, n=37 events.',
  'ScienceDirect (2024) — Jhana 7T fMRI + EEG, 23 000 hr.',
  'PMC 2013 (Neural Plasticity) — Jhāna nucleus-accumbens fMRI.',
  'PLOS One (2017, n=64) — Shoonya, Himalayan Yoga, Vipassana.',
  'Neuroscience Biobehavioral Reviews (2025, Harvard).',
  'PMC 2020 — Neurobiology of meditation meta-analysis (78 studies).'
];
