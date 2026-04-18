export const JAINISM_CARDS = [
  {
    title: 'Prekṣā Dhyāna — Self-perception',
    subtitle: 'α % trajectory over months',
    body: 'Careful perception of subtle internal consciousness. Published norm: α rises from 49.5% baseline → 66.6% at 4 months (n=52, p<0.01). Elderly cohort: 32.3% → 42.3%.',
    formula: 'PPS = (α%_current − α%_baseline) / α%_baseline × 100\nWeek 8: > 15% (non-sig) · Week 16: > 34% (p<0.01)',
    reference: 'AIIMS Delhi + Jain Vishva Bharti (ResearchGate 2018, 2020). Springer Nature (2025) bibliometric review.',
    badge: { kind: 'computed', text: 'Requires ≥ 4 months' },
    accent: '#2a8c5a'
  },
  {
    title: 'Kāyotsarga — Body release',
    subtitle: 'Standing stillness + HRV',
    body: 'Complete detachment from the body while standing. Most effective Prekṣā component for SCR reduction — superior to physical activity and pranayama.',
    formula: 'KQS = 0.40·Stillness% + 0.30·RMSSD_norm + 0.30·α%_norm\nTarget: stillness > 95%, RMSSD ↑ > 15%, α ↑ > 20%',
    reference: 'ResearchGate (2018) — Kāyotsarga SCR reduction, n=25 teachers, p<0.01.',
    badge: { kind: 'computed', text: 'IMU + PPG + α' },
    accent: '#1a8a8a'
  },
  {
    title: 'Sāmāyika — Equanimity',
    subtitle: 'Open-monitoring analog',
    body: 'Ritual equanimity; treat all beings equally. Maps to open-monitoring EEG (α dominant, reduced reactivity).',
    reference: 'Vipassana / open-awareness literature applies (PLOS One 2017).',
    badge: { kind: 'reference', text: 'Analog mapping' },
    accent: '#3672b8'
  },
  {
    title: 'Anuprekṣā — Contemplation',
    subtitle: 'Analytical meditation',
    body: 'Systematic contemplation on impermanence, helplessness, saṃsāra. Frontocentral θ dominant — working memory for structured reflection.',
    reference: 'Frontiers 2024 Tibetan monastery study — analytical meditation profile.',
    badge: { kind: 'computed', text: 'Fm-θ' },
    accent: '#c8850a'
  },
  {
    title: 'Dīrgha Śvāsa Prekṣā',
    subtitle: 'Rhythmic breath',
    body: 'Slow regulated breathing — Jain pranayama analog. Activates parasympathetic tone: RMSSD, pNN50, RSA all rise as documented for SKY and related practices.',
    reference: 'PubMed (2017) SKY HRV — pNN50 p=0.004, RSA p=0.037, RMSSD p=0.013.',
    badge: { kind: 'reference', text: 'PPG + respiration' },
    accent: '#c04a8a'
  },
  {
    title: 'Navkār Mantra',
    subtitle: 'Bija mantra recitation',
    body: 'Repetition of homage to the five supreme beings. Mantra EEG signature: θ coherence ↑, shorter ACW than open awareness, heart coherence at mantra rhythm.',
    reference: 'PMC 2019 (Nature Sci Rep) — religious chanting EEG, α+θ ↑.',
    badge: { kind: 'reference', text: 'Needs audio tagging' },
    accent: '#7048b8'
  }
];

export const JAINISM_REFERENCES = [
  'Springer Nature (2025) — First bibliometric analysis of Prekṣā Dhyāna.',
  'Prekṣā EEG (ResearchGate / AIIMS 2018, n=52) — α 49.5 → 66.6%.',
  'Prekṣā Elderly (Jain Vishva Bharti 2020, n=58).',
  'ResearchGate (2018) — Kāyotsarga SCR, n=25, p<0.01.',
  'ScienceDirect (2020) — PET model for attention in long-term Prekṣā.',
  'SKY HRV (PubMed 2017) — applicable to Dīrgha Śvāsa Prekṣā.'
];
