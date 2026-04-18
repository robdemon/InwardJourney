export const KASHMIR_CARDS = [
  {
    title: 'Pratyabhijñā — Recognition',
    subtitle: 'Core of Trika',
    body: 'Spontaneous recognition of one’s own Śiva-nature. EEG analogs: elevated δ + θ + α during reported nondual events, with γ as a session-level trait.',
    reference: 'Berman & Stevens (2015) — EEG Manifestations of Nondual Experiences.',
    badge: { kind: 'reference', text: 'NDA event ref.' },
    accent: '#7048b8'
  },
  {
    title: 'Spanda — Vibration',
    subtitle: 'Gamma oscillation proxy',
    body: 'The dynamic pulsation of consciousness. Correlates with 60–110 Hz γ (trait). Within the computable Muse window we use CV(α) × θ as an approximate spanda index.',
    formula: 'Spanda_approx = CV(α) × max(0, θ)\nSpanda_full = mean(60–110 Hz γ) × log(practice_hours)',
    reference: 'PLOS One (2017, n=64) — γ trait across three traditions.',
    badge: { kind: 'computed', text: 'Approx from α CV + θ' },
    accent: '#c04a8a'
  },
  {
    title: 'Four Upāyas',
    subtitle: 'Āṇava · Śākta · Śāmbhava · Anupāya',
    body: 'Āṇava: body-level effort (motion, settling). Śākta: mantra / mind (dhāraṇā with effort). Śāmbhava: pure will / dhyāna (effortless α). Anupāya: grace — beyond measurement.',
    formula: 'Āṇava ≈ motion + (1 − pratyāhāra)\nŚākta ≈ effort × ekāgra\nŚāmbhava ≈ dhyāna × (1 − 2·effort)',
    reference: 'NIMHANS bioRxiv (2025, n=103) — ACW non-duality index in Isha meditators.',
    badge: { kind: 'computed', text: 'Upāya classifier' },
    accent: '#c8850a'
  },
  {
    title: 'ACW — Non-duality Index',
    subtitle: 'Intrinsic neural timescale',
    body: 'The lag at which EEG autocorrelation decays to 50% — equal timescales for internal and external attention = Turīya at the neural level.',
    formula: 'ACW_diff = ACW_internal − ACW_external\n≈0 (<50 ms) → Turīya signature · >>0 → dualistic',
    reference: 'NIMHANS bioRxiv (2025, n=103, 5507 avg practice hours). ScienceDirect (2024, Northoff).',
    badge: { kind: 'reference', text: 'Requires 2 tasks' },
    accent: '#3672b8'
  },
  {
    title: 'Five Kañcukas',
    subtitle: 'Māyā’s coverings → EEG dimensions',
    body: 'Kalā (limited agency) → β. Vidyā (limited knowing) → γ. Rāga (attachment) → HR variability. Kāla (time) → α rhythm. Niyati (space) → frontal alpha asymmetry.',
    reference: 'Trika doctrinal mapping; proxies from Muse band literature.',
    badge: { kind: 'computed', text: 'All 5 computable' },
    accent: '#1a8a8a'
  },
  {
    title: 'Shoonya Gamma Index (SGI)',
    subtitle: 'Shambhavopaya fingerprint',
    body: 'Unique frontal-central γ elevation in open-awareness meditators, absent from Vipassana or mantra traditions.',
    formula: 'SGI = γ(AF7,AF8) / γ(TP9,TP10)\nSGI > 1.2 → Shoonya-specific · ≈1.0 → general meditation γ · <0.8 → focused/mantra',
    reference: 'PLOS One (2017, n=64) — Isha Shoonya EEG. NIMHANS Isha Yoga (2024, n=103).',
    badge: { kind: 'reference', text: 'Needs γ channel split' },
    accent: '#2a8c5a'
  },
  {
    title: 'Cessation (Nirodha)',
    subtitle: 'Anupāya — spontaneous',
    body: 'Linear α decline in the 40 s preceding an event, followed by global 25–45 Hz γ synchronisation. Distinct from sleep: neural complexity increases rather than decreases.',
    formula: 'cessation = (α_slope < −0.02) AND (γ_sync > 2 × baseline)',
    reference: 'PMC (2024) — Cessation EEG case study. bioRxiv (2025, n=5 adepts).',
    badge: { kind: 'reference', text: 'Event-level detection' },
    accent: '#dc4a3a'
  }
];

export const KASHMIR_REFERENCES = [
  'Berman & Stevens (2015) — NDA EEG events: δ, θ, α elevated.',
  'Josipovic (2014, 2021) — Nondual awareness neural correlates.',
  'Braboszcz et al. (2017) — Increased γ in three meditation traditions.',
  'NIMHANS / bioRxiv (2025) — ACW non-duality index, n=103.',
  'ScienceDirect (2024) — Intrinsic neural timescales differ across techniques.',
  'PMC (2024) — Advanced mindfulness cessation EEG.',
  'bioRxiv (2025) — Extended cessation EEG+MEG, n=5.',
  'Neural Plasticity (2013) — Ecstatic meditation (jhāna) fMRI+EEG.'
];
