import { clamp } from '../scripts/mathHelpers.js';

const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

const NA = { value: '—', valueLabel: 'not derivable from this CSV' };

export const TAOISM_CARDS = [
  {
    title: 'Qigong — Seated cultivation',
    subtitle: 'α + θ + HRV',
    body: 'Still Qigong: cultivation of Qi via breath, visualisation, intention. α + θ ↑ during session; SDNN and HF power significantly improved (148-study meta-analysis).',
    reference: 'Heart and Mind (2024) — Tai Chi/Qigong HRV meta-analysis, 148 studies, 23 RCTs.',
    badge: { kind: 'computed', text: 'α + θ this session' },
    accent: '#2a8c5a',
    compute: (s) => {
      const v = s.bands.alpha + s.bands.theta;
      return { value: fmt(v, 3), valueLabel: 'α + θ mean', interpretation: v > 0.3 ? 'Qi cultivation signature' : 'below signature' };
    }
  },
  {
    title: 'Tài Chí Chuán',
    subtitle: 'Moving meditation',
    body: 'Unique biometric profile: simultaneous EEG + IMU movement. Frontal θ ↑, PFC/motor/occipital connectivity changes (fNIRS), SDNN rises, LF falls.',
    formula: 'TC_Quality = 0.40·smoothness + 0.30·(1 − jerk_norm) + 0.30·rhythm_reg\nQi_State = TC_Quality × EEG_θα_norm',
    reference: 'Nature Sci Rep (2019, n=23) — Chen-style TCC fNIRS. Frontiers 2024 — 24-form TCC EEG RCT.',
    badge: { kind: 'reference', text: 'Needs movement seg.' },
    accent: '#3672b8',
    compute: () => NA
  },
  {
    title: 'Zhàn Zhuāng — Standing post',
    subtitle: 'Wu Chi posture',
    body: 'Stationary standing meditation — near-zero head movement + sustained parasympathetic activation. IMU stillness % from Muse gyroscope captures the essential quality.',
    reference: 'Qigong standing meditation HRV literature.',
    badge: { kind: 'computed', text: 'Gyro stillness' },
    accent: '#c8850a',
    compute: (s) => {
      const gyro = s.segments.reduce((a, seg) => a + seg.gyro_avg, 0) / s.segments.length;
      const stillness = clamp(1 - gyro / 10, 0, 1) * 100;
      return { value: `${stillness.toFixed(0)}%`, valueLabel: 'stillness', interpretation: stillness > 90 ? 'Wu Chi grade' : stillness > 70 ? 'settled' : 'restless' };
    }
  },
  {
    title: 'Wú Wéi — Effortless action',
    subtitle: 'Flow state',
    body: 'The central Taoist principle of acting without striving. Neurally: α + θ ↑ with frontal β ↓ — transient hypofrontality characteristic of flow.',
    reference: 'Flow-state EEG literature (Csikszentmihalyi-aligned studies).',
    badge: { kind: 'computed', text: 'Low β · high α' },
    accent: '#7048b8',
    compute: (s) => {
      const flow = clamp(s.bands.alpha - Math.max(0, s.bands.beta_af), 0, 1);
      return { value: fmt(flow, 3), valueLabel: 'Wú Wéi proxy', interpretation: flow > 0.15 ? 'hypofrontal flow' : 'effortful' };
    }
  },
  {
    title: 'Three Treasures — Jing / Qi / Shen',
    subtitle: 'Nèidān inner alchemy',
    body: 'Jīng (essence) = HRV baseline · Qì (energy) = cardiorespiratory coupling · Shén (spirit) = EEG α/θ/γ. Three sensor domains captured simultaneously by Muse S Athena.',
    formula: 'TTI = 0.33·RMSSD_norm + 0.33·CRC + 0.33·EEG_calm_norm\nTTI > 0.70 = three treasures in balance',
    reference: 'Heart and Mind meta (2024). Nèidān framework mapping.',
    badge: { kind: 'reference', text: 'Requires PPG + EEG' },
    accent: '#c04a8a',
    compute: () => NA
  },
  {
    title: 'Yì Jīn Jīng Qigong',
    subtitle: 'Tendon-changing',
    body: 'Movement + breath + intention. Post-stroke depression RCT showed δ/θ/α/β all rising in left frontal F3 (Muse AF7 analog).',
    reference: 'Sun et al. (2022) — Yi Jin Jing EEG biofeedback, cited in Frontiers 2024.',
    badge: { kind: 'computed', text: 'AF7 α + θ' },
    accent: '#1a8a8a',
    compute: (s) => {
      const v = Math.max(0, s.bands.alpha_af7) + Math.max(0, s.bands.theta_af);
      return { value: fmt(v, 3), valueLabel: 'AF7 α + θ', interpretation: v > 0.2 ? 'F3 signature present' : 'below signature' };
    }
  }
];

export const TAOISM_REFERENCES = [
  'Heart and Mind (2024) — Tai Chi/Qigong HRV meta, 148 studies.',
  'Nature Sci Rep (2019) — Tai Chi fNIRS connectivity, n=23.',
  'Frontiers Psychology (2024) — 24-form Tai Chi EEG RCT.',
  'PubMed (2024) — Tai Chi HRV systematic review, SDNN MD=8.33 ms.',
  'JICM (2025) — Tai Chi/Qigong whole-person health imaging review.'
];
