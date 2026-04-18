export const PATANJALI_CARDS = [
  {
    title: 'YS 1.2 — Citta-vṛtti-nirodhaḥ',
    subtitle: 'Primary sutra',
    body: 'Yoga is the stilling of mental fluctuations. Reduced vṛtti activity appears as stable α, low blink rate and a dropping mind-wandering index.',
    reference: 'Krigolson et al. (2017, 2021) — Muse validation of N200/P300 ERP from TP9/TP10.',
    badge: { kind: 'computed', text: 'α stability, MWI' },
    accent: '#2a8c5a'
  },
  {
    title: 'Five Vṛttis in EEG',
    subtitle: 'Pramāṇa · Viparyaya · Vikalpa · Nidrā · Smṛti',
    body: 'Pramāṇa (valid knowing) → frontal β. Viparyaya (error) → β + unstable α. Vikalpa (verbal imagination) → β-γ coupling. Nidrā (sleep) → δ dominance. Smṛti (memory) → θ activity.',
    reference: 'Frontiers 2018 review of meditation neural oscillations.',
    badge: { kind: 'reference', text: 'Band-to-vṛtti map' },
    accent: '#7048b8'
  },
  {
    title: 'Aṣṭāṅga — Inner Limbs on EEG',
    subtitle: 'Pratyāhāra → Dhāraṇā → Dhyāna → Samādhi',
    body: 'Limbs 5–8 have distinct signatures: pratyāhāra (α > 25% rise + low blinks), dhāraṇā (Fm-theta + effort), dhyāna (coherent α + near-zero effort), samādhi (γ burst + PAC + near-zero MWI).',
    reference: 'Sera-Jey Monastery EEG (Frontiers 2024, n=23 monks). SKY EEG PMC 2025 (d=2.04 aperiodic).',
    badge: { kind: 'computed', text: 'Limbs 5–7 covered' },
    accent: '#3672b8'
  },
  {
    title: 'SKY 5-Phase EEG Signature',
    subtitle: 'Sudarshan Kriya Yoga',
    body: 'Published effect sizes per phase. Pranayama: θ ↑ (d=0.63). Kriya: θ sustained, aperiodic begins to drop. Yoga-nidra: α ↓ (d=1.70), central δ ↑, aperiodic ↓ (d=2.04). Post-rest: normalisation.',
    reference: 'SKY EEG (PMC 2025, n=43) — largest published EEG dataset for any Hatha yoga-derived practice.',
    badge: { kind: 'reference', text: 'Requires labelled phases' },
    accent: '#c8850a'
  },
  {
    title: 'Local Sleep Index (Yoga Nidra)',
    subtitle: 'Turiya electrophysiology',
    body: 'Central δ ↑ simultaneous with PFC δ ↓ — the neural fingerprint of Yoga Nidra. Awareness persists while body enters local sleep.',
    formula: 'LSI = Central_δ / PFC_δ − 1\nYN signature: LSI > 0.5 central AND LSI < −0.3 PFC',
    reference: 'PMC (2022) — Local Sleep During Yoga Nidra, n=30. Central δ p=0.033, PFC δ p=0.041.',
    badge: { kind: 'reference', text: 'Requires 4-ch δ split' },
    accent: '#1a8a8a'
  },
  {
    title: 'Bhramari → Paroxysmal Gamma',
    subtitle: 'Pranayama limb',
    body: 'Humming-bee pranayama produces paroxysmal γ waves — the largest γ effect reported for any single yogic practice. Spanda proxy in the Kashmir mapping.',
    reference: 'ScienceDirect (2008). PMC (2020) — Ujjayi elevates α 40%, β ↓ 30%.',
    badge: { kind: 'reference', text: 'Needs >30 Hz access' },
    accent: '#c04a8a'
  },
  {
    title: 'DMN Proxy — TP9/TP10 α',
    subtitle: 'Ego-reference network',
    body: 'Posterior α at rest stands in for the default-mode network. Experienced meditators show >20% DMN suppression across every style of meditation.',
    formula: 'DMN_activity = mean(TP9_α, TP10_α)\nDMN_suppression = (baseline − meditation) / baseline × 100',
    reference: 'PNAS 2011 (Brewer, Harvard) — DMN deactivation across all meditation types.',
    badge: { kind: 'computed', text: 'TP9/TP10 α' },
    accent: '#dc4a3a'
  }
];

export const PATANJALI_REFERENCES = [
  'Krigolson et al. (2017, 2021) — Muse N200/P300 validation.',
  'SKY EEG PMC (2025) — θ d=0.63, α d=1.70, aperiodic d=2.04.',
  'PMC (2022) — Yoga Nidra Local Sleep, n=30.',
  'Vienna Hatha Yoga RCT (2024) — Frontocentral θ ↑, n=98.',
  'PubMed (2018) — 8-week Hatha Yoga → ↓ P300 latency.',
  'PLOS One (2025) — Nadi Shodhana EEG, paced nostril breathing.',
  'Nature Sci Rep (2024) — Connectivity changes during Yoga Nidra, n=60.',
  'Springer Mindfulness (2026) — Isha Yoga 7-min signatures, n=103.',
  'Brewer PNAS (2011) — DMN deactivation in experienced meditators.'
];
