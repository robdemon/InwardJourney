import { clamp } from '../scripts/mathHelpers.js';

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
const pct = (n, d = 0) => (Number.isFinite(n) ? `${(n * 100).toFixed(d)}%` : '—');

const NA = { value: '—', valueLabel: 'not derivable from this CSV' };

const sattvaRajasTamas = (segs) => {
  const sa = segs.reduce((a, s) => a + s.sattva, 0) / segs.length;
  const ra = segs.reduce((a, s) => a + s.rajas, 0) / segs.length;
  const ta = segs.reduce((a, s) => a + s.tamas, 0) / segs.length;
  return { sa, ra, ta };
};

export const SAMKHYA_CARDS = [
  {
    title: 'Sattva Index',
    subtitle: 'Composite · 5 components',
    body: 'Multi-sensor composite for Sattva dominance. Weighted α, PAF, RMSSD, HbO and stillness against a 30-day personal baseline.',
    formula: 'Sattva_Index = 0.30·α% + 0.20·PAF + 0.20·RMSSD + 0.20·HbO + 0.10·Stillness%\nTarget: > 70 (strong Sattva dominance)',
    reference: 'Wolf (1999) — Psychometric analysis of the Three Gunas. Frontiers in Psychology (2023) — Guna composition in psychiatric disorders.',
    badge: { kind: 'reference', text: 'fNIRS + HRV required' },
    accent: '#2a8c5a',
    compute: () => NA
  },
  {
    title: 'Guna State Classifier',
    subtitle: 'Rule-based · waking EEG',
    body: 'Classifies the current guna regime from band powers and Sattva Index. Useful as a live dashboard badge.',
    formula: 'if Sattva_Index > 65 → Sattva Dominant\nif 40–65 & HiBeta↑ → Rajas Dominant\nif <40 & Delta high → Tamas Dominant\nif Gamma burst & Sattva > 75 → Samadhi Approach',
    reference: 'Kar et al. (2021) — Neuroscience of Yogic Theory of Consciousness. Oxford / MIT.',
    badge: { kind: 'computed', text: 'Computable now' },
    accent: '#c8850a',
    compute: (s) => {
      const { sa, ra, ta } = sattvaRajasTamas(s.segments);
      const dom = sa >= ra && sa >= ta ? 'Sattva' : ra >= ta ? 'Rajas' : 'Tamas';
      return { value: dom, valueLabel: 'dominant guṇa', interpretation: `S ${fmt(sa, 2)} · R ${fmt(ra, 2)} · T ${fmt(ta, 2)}` };
    }
  },
  {
    title: 'Vritti Reduction Rate (VRR)',
    subtitle: 'Longitudinal · 8-week arc',
    body: 'Primary Yoga Sutra 1.2 KPI. Measures fall in the mind-wandering index from a personal baseline — the empirical analog of citta-vritti-nirodhah.',
    formula: 'VRR = (MWI_baseline − MWI_current) / MWI_baseline × 100\nTarget: VRR > 30% after 8 weeks of daily practice',
    reference: 'Isha Yoga EEG (Springer Mindfulness 2026, n=103) — α+θ peaks at 7–10 min in advanced meditators.',
    badge: { kind: 'reference', text: 'Needs 8-week baseline' },
    accent: '#7048b8',
    compute: (s) => {
      const cv = s.segments.reduce((a, seg) => a + seg.cv_alpha, 0) / s.segments.length;
      const mwi = clamp(cv * 0.5 + s.blink_rate / 20, 0, 1);
      return { value: fmt(mwi, 2), valueLabel: 'current MWI proxy', interpretation: 'baseline needed for VRR' };
    }
  },
  {
    title: 'Buddhi Purity Index',
    subtitle: 'Per segment · Sattva / total',
    body: 'Ratio of sattva to total guna quantity per ~5 min window. Higher = clearer discrimination, the buddhi functioning close to puruṣa.',
    formula: 'Buddhi_Purity = sattva / (sattva + rajas + tamas)\nSattva = 0.35·α + 0.25·β⁻ + 0.20·cv-α inv + 0.20·stillness',
    reference: 'Preprints.org (2025) — From Adhyātma Vidyā to Neural Correlates: Sāṃkhya tattvas as hierarchical brain states.',
    badge: { kind: 'computed', text: 'Computable now' },
    accent: '#3672b8',
    compute: (s) => {
      const { sa, ra, ta } = sattvaRajasTamas(s.segments);
      const purity = sa / (sa + ra + ta || 1);
      const verdict = purity > 0.5 ? 'clear' : purity > 0.35 ? 'emerging' : 'clouded';
      return { value: pct(purity), valueLabel: 'buddhi purity', interpretation: verdict };
    }
  },
  {
    title: 'Dharana Depth Score',
    subtitle: 'Composite · 4 components',
    body: 'Multi-band composite that places a session on the vritti → dharana → dhyana → samadhi continuum.',
    formula: 'DDS = 0.35·θ% + 0.30·α% + 0.20·Coherence + 0.15·HbO\n0–30: vikṣepa · 30–55: settling · 55–75: dhāraṇā · 75–90: dhyāna · >90: samādhi',
    reference: 'Frontiers in Neuroscience (2018) — Neural Oscillations Underlying Meditation.',
    badge: { kind: 'reference', text: 'Coherence + fNIRS ref.' },
    accent: '#1a8a8a',
    compute: (s) => {
      const segs = s.segments;
      const tot = segs.reduce((a, seg) => a + Math.abs(seg.alpha) + Math.abs(seg.beta) + Math.abs(seg.theta) + Math.abs(seg.delta) + Math.abs(seg.gamma), 0) / segs.length;
      const aPct = Math.abs(s.bands.alpha) / (tot || 1);
      const tPct = Math.abs(s.bands.theta) / (tot || 1);
      const approx = clamp(0.35 * tPct + 0.30 * aPct, 0, 1) * 100;
      const phase = approx > 75 ? 'dhyāna' : approx > 55 ? 'dhāraṇā' : approx > 30 ? 'settling' : 'vikṣepa';
      return { value: approx.toFixed(0), valueLabel: 'DDS (θ+α only)', interpretation: phase };
    }
  },
  {
    title: 'Tattva Mapping — 24 + 1',
    subtitle: 'Puruṣa–Prakṛti scaffold',
    body: 'Buddhi (α coherence + β suppression), Ahaṃkāra (β activity), Manas (blinks + γ processing), 5 jñānendriyas + 5 tanmātras (pratyāhāra). Puruṣa itself is inferred, not measured.',
    reference: 'Kar et al. (2021), Rojhun (2024), Preprints.org (2025).',
    badge: { kind: 'reference', text: 'Conceptual map' },
    accent: '#c04a8a',
    compute: (s) => {
      const buddhi = clamp(s.bands.alpha * 2 + Math.abs(Math.min(0, s.bands.beta)), 0, 1);
      return { value: fmt(buddhi, 2), valueLabel: 'buddhi (inner instrument)', interpretation: 'see stack above' };
    }
  }
];

export const SAMKHYA_REFERENCES = [
  'Kar et al. (2021) — Neuroscience of Yogic Theory of Consciousness. Oxford / PMC.',
  'Rojhun R. (2024) — Samkhya Yoga concept of mind in light of neuroscience.',
  'Frontiers in Psychology (2023) — Guna composition in psychiatric disorders.',
  'Wolf D.B. (1999) — Psychometric analysis of the Three Gunas.',
  'Deepeshwar et al. (2015) — Hemodynamic responses on PFC related to meditation (fNIRS).',
  'Isha Yoga EEG (Springer Mindfulness 2026, n=103).',
  'Frontiers in Neuroscience (2018) — Review of Neural Oscillations Underlying Meditation.',
  'Preprints.org (2025) — From Adhyātma Vidyā to Neural Correlates.'
];
