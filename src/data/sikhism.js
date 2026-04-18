import { clamp } from '../scripts/mathHelpers.js';

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

const NA = { value: '—', valueLabel: 'not derivable from this CSV' };

export const SIKHISM_CARDS = [
  {
    title: 'Nām Simran',
    subtitle: 'Divine-name remembrance',
    body: 'Continuous remembrance of Waheguru. Progresses verbal → sub-vocal → mental (ajapa). Each stage deepens θ coherence, raises α, lowers LF/HF. Heart coherence at ~6 bpm.',
    formula: 'SimDI = 0.30·θ_coh + 0.30·Heart_coh + 0.20·Resp_reg + 0.20·Calm%\nTarget for sustained Nām: SimDI > 65',
    reference: 'PLOS One (2017) — Himalayan Yoga mantra EEG. Frontiers Aging (2023) — Muse Kirtan Kriya, n=40.',
    badge: { kind: 'reference', text: 'Needs coherence calc' },
    accent: '#3672b8',
    compute: () => NA
  },
  {
    title: 'Gurbāṇī Kīrtan',
    subtitle: 'Sacred hymn singing',
    body: 'Singing from Gurū Granth Sāhib in classical Rāgas. Religious chanting EEG signature (α + θ ↑) distinct from silent meditation. Group singing adds inter-brain coherence.',
    reference: 'PMC 2019 (Nature Scientific Reports) — neurophysiological correlates of religious chanting.',
    badge: { kind: 'computed', text: 'α + θ this session' },
    accent: '#c8850a',
    compute: (s) => {
      const v = s.bands.alpha + s.bands.theta;
      return { value: fmt(v, 3), valueLabel: 'α + θ mean', interpretation: v > 0.3 ? 'chanting signature' : 'below chant signature' };
    }
  },
  {
    title: 'Kīrtan Kriyā (Sa-Ta-Na-Ma)',
    subtitle: '12-min multisensory practice',
    body: 'Vocal → whispered → mental → whispered → vocal. UCLA/ARPF protocol. Muse EEG study (Frontiers 2023, n=40 incl. MCI) validates α+θ across phases and cognitive resilience improvement.',
    reference: 'Frontiers Aging Neuroscience (2023) — Muse EEG Kirtan Kriya.',
    badge: { kind: 'computed', text: 'α + θ over 12m' },
    accent: '#c04a8a',
    compute: (s) => {
      const v = s.bands.alpha + s.bands.theta;
      return {
        value: fmt(v, 3),
        valueLabel: 'α + θ mean',
        interpretation: s.duration >= 11 && s.duration <= 13 ? '12-min window match' : `duration ${s.duration}m`
      };
    }
  },
  {
    title: 'Sehaj Avasthā',
    subtitle: 'State of equipoise',
    body: 'Effortless, natural equipoise — haumai (ego) dissolved. Neural analog: resting θ+α coherence, DMN suppression, low MWI, high HRV.',
    reference: 'NIMHANS bioRxiv (2025) — equanimity ↔ shorter ACW, balanced affect.',
    badge: { kind: 'computed', text: 'Calm% + stillness' },
    accent: '#7048b8',
    compute: (s) => {
      const gyro = s.segments.reduce((a, seg) => a + seg.gyro_avg, 0) / s.segments.length;
      const calm = clamp(1 - gyro / 10, 0, 1) * 0.5 + clamp(1 - s.blink_rate / 20, 0, 1) * 0.5;
      return { value: `${(calm * 100).toFixed(0)}%`, valueLabel: 'equipoise %', interpretation: calm > 0.7 ? 'sehaj emerging' : 'still haumai' };
    }
  },
  {
    title: 'Nitnem Bāṇīs',
    subtitle: 'Daily prayer recitation',
    body: 'Five daily prayers, rhythmic oral practice. Entrains α + θ; respiratory pacing drives HRV improvements.',
    reference: 'Religious chanting meta-analysis. Rhythmic speech EEG entrainment literature.',
    badge: { kind: 'reference', text: 'Analog mapping' },
    accent: '#1a8a8a',
    compute: () => NA
  },
  {
    title: 'Sevā — Selfless service',
    subtitle: 'Prosocial engagement',
    body: 'Physical service without ego. Prosocial acts raise HRV (parasympathetic), left prefrontal α asymmetry (positive affect), lower cortisol.',
    reference: 'Davidson (1992) — left frontal α asymmetry → positive affect.',
    badge: { kind: 'computed', text: 'FAA' },
    accent: '#2a8c5a',
    compute: (s) => {
      const af7 = Math.max(1e-4, s.bands.alpha_af7);
      const af8 = Math.max(1e-4, s.bands.alpha_af8);
      const faa = Math.log(af8) - Math.log(af7);
      return { value: fmt(faa, 3), valueLabel: 'FAA', interpretation: faa > 0 ? 'positive affect' : 'withdrawal' };
    }
  }
];

export const SIKHISM_REFERENCES = [
  'Frontiers Aging Neuroscience (2023) — Muse Kirtan Kriya, n=40.',
  'PMC 2019 (Nature Sci Rep) — Religious chanting neurophysiology.',
  'ResearchGate (2011) — Kirtan Kriya SPECT cerebral blood flow.',
  'PLOS One (2017) — Himalayan Yoga mantra EEG (Naam Simran analog).'
];
