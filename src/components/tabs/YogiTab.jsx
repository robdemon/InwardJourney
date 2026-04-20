import { useEffect, useMemo, useState } from 'react';
import { C, CHITTA_COLORS } from '../../scripts/constants.js';
import { clamp } from '../../scripts/mathHelpers.js';

// 2D SVG coordinates. Figure axis x=240; y anchored to anatomical landmarks:
//   Bindu above crown, Sahasrāra at crown, Ājñā at brow, Viśuddha at throat,
//   Anāhata at mid-chest, Maṇipūra at navel, Svādhiṣṭhāna at sacrum,
//   Mūlādhāra at the perineum (top of folded legs).
const CHAKRA_LIMBS = [
  { key: 'yama',       limb: 'Yama',       chakra: 'Mūlādhāra',    color: '#c04a8a', y: 470, limbKey: null,         spin: 'cw',  petals: 4,  spinDur: '8s',   innerDur: '5s'   },
  { key: 'niyama',     limb: 'Niyama',     chakra: 'Svādhiṣṭhāna', color: '#dc4a3a', y: 430, limbKey: null,         spin: 'ccw', petals: 6,  spinDur: '6.5s', innerDur: '4s'   },
  { key: 'asana',      limb: 'Āsana',      chakra: 'Maṇipūra',     color: '#d48c2a', y: 380, limbKey: 'stillness',  spin: 'cw',  petals: 10, spinDur: '5.5s', innerDur: '3.3s' },
  { key: 'pranayama',  limb: 'Prāṇāyāma',  chakra: 'Anāhata',      color: '#2a8c5a', y: 300, limbKey: 'breath',     spin: 'ccw', petals: 12, spinDur: '4.5s', innerDur: '2.7s' },
  { key: 'pratyahara', limb: 'Pratyāhāra', chakra: 'Viśuddha',     color: '#1a8a8a', y: 212, limbKey: 'pratyahara', spin: 'cw',  petals: 16, spinDur: '4s',   innerDur: '2.4s' },
  { key: 'dharana',    limb: 'Dhāraṇā',    chakra: 'Ājñā',         color: '#3672b8', y: 135, limbKey: 'dharana',    spin: 'ccw', petals: 6,  spinDur: '3.5s', innerDur: '2.1s' },
  { key: 'dhyana',     limb: 'Dhyāna',     chakra: 'Sahasrāra',    color: '#7048b8', y:  88, limbKey: 'dhyana',     spin: 'cw',  petals: 12, spinDur: '3s',   innerDur: '1.8s' },
  { key: 'samadhi',    limb: 'Samādhi',    chakra: 'Bindu',        color: '#c8850a', y:  48, limbKey: 'mds',        spin: 'ccw', petals: 8,  spinDur: '2.5s', innerDur: '1.5s' }
];

function limbValueFromSegment(seg, limbKey) {
  if (!limbKey) return 0;
  if (limbKey === 'stillness') return clamp(1 - seg.gyro_avg / 10, 0, 1);
  if (limbKey === 'breath')    return clamp(1 - seg.blink_rate / 20, 0, 1);
  return clamp(seg[limbKey] ?? 0, 0, 1);
}

function SeatedFigure() {
  const body = '#3a3632';
  return (
    <g>
      <ellipse cx="240" cy="598" rx="158" ry="22" fill="#8a6a45" />
      <ellipse cx="240" cy="582" rx="140" ry="18" fill="#6a4a2a" />
      <path d="M 78 568 Q 68 470 240 460 Q 412 470 402 568 Q 402 580 240 580 Q 78 580 78 568 Z" fill={body} />
      <path d="M 118 522 Q 240 498 362 522" stroke="#24211e" strokeWidth="2" fill="none" opacity="0.55" />
      <path d="M 168 460 Q 158 410 182 365 L 298 365 Q 322 410 312 460 Z" fill={body} />
      <path d="M 182 365 Q 176 300 192 248 L 288 248 Q 304 300 298 365 Z" fill={body} />
      <path d="M 188 250 Q 146 300 148 360 Q 150 422 200 450 L 240 452 L 240 428 Q 210 432 190 402 Q 172 348 188 298 Q 196 272 200 252 Z" fill={body} />
      <path d="M 292 250 Q 334 300 332 360 Q 330 422 280 450 L 240 452 L 240 428 Q 270 432 290 402 Q 308 348 292 298 Q 284 272 280 252 Z" fill={body} />
      <ellipse cx="240" cy="244" rx="62" ry="22" fill={body} />
      <rect x="222" y="185" width="36" height="52" rx="5" fill={body} />
      <circle cx="240" cy="135" r="54" fill="#d4a574" />
      <path d="M 215 132 Q 225 138 232 132" stroke="#6a4a2a" strokeWidth="1.6" fill="none" opacity="0.65" />
      <path d="M 248 132 Q 255 138 265 132" stroke="#6a4a2a" strokeWidth="1.6" fill="none" opacity="0.65" />
      <path d="M 228 160 Q 240 165 252 160" stroke="#6a4a2a" strokeWidth="1.2" fill="none" opacity="0.5" />
    </g>
  );
}

// Only the scale-transition wrapper needs CSS. Spin uses SVG animateTransform which is
// immune to React re-renders and never restarts when other component state changes.
const CHAKRA_CSS = `
  .ck-sz { transform-box: fill-box; transform-origin: center; transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
`;

const BASE_R = 20; // Fixed rendering radius — size controlled entirely via CSS scale

// Y positions of each chakra along the suṣumnā axis (matches CHAKRA_LIMBS[].y)
const CHAKRA_Y = [470, 430, 380, 300, 212, 135, 88, 48];
const SUSHUMNA_BOT = 470;
const SUSHUMNA_TOP = 48;
const SUSHUMNA_H   = SUSHUMNA_BOT - SUSHUMNA_TOP; // 422

// Electric kundalini current rising up the suṣumnā channel.
// Uses animate cy (not animateMotion+mpath) for reliable cross-browser rendering.
// Rendered AFTER SeatedFigure so sparks appear over the body, not beneath it.
function KundaliniCurrent({ mds }) {
  const energy = clamp(mds, 0, 1);
  // Always visible; intensity scales with MDS
  const travelDur = (1.4 - energy * 0.9).toFixed(2) + 's';
  const sparkR    = (4 + energy * 5).toFixed(1);
  const glowR     = (8 + energy * 10).toFixed(1);
  const lineW     = (1.2 + energy * 2).toFixed(1);

  return (
    <g>
      {/* Glowing channel overlay — brighter than the dashed background line */}
      <line x1="240" y1={SUSHUMNA_BOT} x2="240" y2={SUSHUMNA_TOP}
        stroke="#b8a8f8" strokeWidth={lineW} strokeLinecap="round"
        opacity={0.35 + energy * 0.45}
        filter="url(#kl-glow)"
      />

      {/* Primary spark — animates cy from bottom to top */}
      <circle cx={240} cy={SUSHUMNA_BOT} r={sparkR}
        fill="#ffffff" filter="url(#kl-glow)" opacity="0.95">
        <animate attributeName="cy"
          from={SUSHUMNA_BOT} to={SUSHUMNA_TOP}
          dur={travelDur} repeatCount="indefinite" calcMode="linear"
        />
      </circle>

      {/* Secondary spark — phase-offset by ~45% so two pulses are always in flight */}
      <circle cx={240} cy={SUSHUMNA_BOT} r={parseFloat(sparkR) * 0.6}
        fill="#d0b8ff" filter="url(#kl-glow)" opacity="0.8">
        <animate attributeName="cy"
          from={SUSHUMNA_BOT} to={SUSHUMNA_TOP}
          dur={travelDur}
          begin={`-${(parseFloat(travelDur) * 0.45).toFixed(2)}s`}
          repeatCount="indefinite" calcMode="linear"
        />
      </circle>

      {/* Chakra node flash rings — light up as each spark passes */}
      {CHAKRA_Y.map((y, i) => {
        const delay = ((SUSHUMNA_BOT - y) / SUSHUMNA_H * parseFloat(travelDur)).toFixed(2);
        return (
          <circle key={i} cx={240} cy={y} r={glowR} fill="none"
            stroke="#e0d0ff" strokeWidth="1.5" opacity="0">
            <animate attributeName="opacity"
              values={`0;${(0.55 + energy * 0.4).toFixed(2)};0`}
              dur={travelDur} begin={`${delay}s`} repeatCount="indefinite"
            />
          </circle>
        );
      })}
    </g>
  );
}

function ChakraSVG({ cx, cy, color, intensity, label, limb, side, spin, petals, spinDur, innerDur }) {
  const haloR = BASE_R + 32;
  const haloOp = (0.08 + intensity * 0.34).toFixed(3);
  const scale = (0.45 + intensity * 0.82).toFixed(4);
  const outerTo = spin === 'cw' ? '360' : '-360';
  const innerTo = spin === 'cw' ? '-360' : '360';

  const textX = side === 'right' ? cx + haloR + 12 : cx - haloR - 12;
  const anchor = side === 'right' ? 'start' : 'end';
  const lineX1 = side === 'right' ? cx + haloR + 3 : cx - haloR - 3;
  const lineX2 = side === 'right' ? textX - 4 : textX + 4;

  // Petal positions depend only on geometry constants — DOM never mutates during playback
  const outerPetals = useMemo(() =>
    Array.from({ length: petals }, (_, i) => {
      const ang = i * 360 / petals;
      const rad = ang * Math.PI / 180;
      const px = cx + Math.cos(rad) * BASE_R * 0.72;
      const py = cy + Math.sin(rad) * BASE_R * 0.72;
      return (
        <ellipse key={i} cx={px} cy={py}
          rx={BASE_R * 0.38} ry={BASE_R * 0.16}
          fill={color} opacity={0.72}
          transform={`rotate(${ang} ${px} ${py})`}
        />
      );
    }),
    [cx, cy, color, petals]
  );

  const innerCount = Math.max(3, Math.floor(petals / 2));
  const innerPetals = useMemo(() =>
    Array.from({ length: innerCount }, (_, i) => {
      const ang = i * 360 / innerCount;
      const rad = ang * Math.PI / 180;
      const px = cx + Math.cos(rad) * BASE_R * 0.42;
      const py = cy + Math.sin(rad) * BASE_R * 0.42;
      return (
        <ellipse key={i} cx={px} cy={py}
          rx={BASE_R * 0.20} ry={BASE_R * 0.09}
          fill={color} opacity={0.82}
          transform={`rotate(${ang} ${px} ${py})`}
        />
      );
    }),
    [cx, cy, color, innerCount]
  );

  return (
    <g>
      {/* Ambient halo — only opacity responds to intensity */}
      <circle cx={cx} cy={cy} r={haloR} fill={color} opacity={haloOp} />

      {/* Scale wrapper: CSS transition for smooth grow/shrink only */}
      <g className="ck-sz" style={{ transform: `scale(${scale})` }}>
        {/* Outer petals — SVG animateTransform: continuous spin, never restarted by React */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`${outerTo} ${cx} ${cy}`}
            dur={spinDur} repeatCount="indefinite"
          />
          {outerPetals}
        </g>
        {/* Inner petals — counter-spin */}
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`${innerTo} ${cx} ${cy}`}
            dur={innerDur} repeatCount="indefinite"
          />
          {innerPetals}
        </g>
        <circle cx={cx} cy={cy} r={BASE_R} fill={color} opacity={0.88} />
        <circle cx={cx} cy={cy} r={BASE_R * 0.38} fill="#fff" opacity={0.4} />
      </g>

      {/* Labels — outside scale group so position stays fixed */}
      <line x1={lineX1} y1={cy} x2={lineX2} y2={cy}
        stroke={color} strokeWidth="1" opacity="0.45" strokeDasharray="3,3" />
      <text x={textX} y={cy - 2}  fill={color}   fontSize="14" fontWeight="600"
        fontFamily="DM Sans, sans-serif" textAnchor={anchor}>{label}</text>
      <text x={textX} y={cy + 15} fill="#6a6560" fontSize="11"
        fontFamily="DM Sans, sans-serif" textAnchor={anchor}>{limb}</text>
    </g>
  );
}

function MetricBar({ label, value, color, showPct }) {
  const pct = clamp(value, 0, 1) * 100;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 11px DM Sans', marginBottom: 3 }}>
        <span style={{ color: 'var(--dim)' }}>{label}</span>
        <span style={{ color, fontFamily: 'JetBrains Mono' }}>{showPct ? `${pct.toFixed(0)}%` : value.toFixed(2)}</span>
      </div>
      <div style={{ height: 6, background: '#eae7e1', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

export default function YogiTab({ session }) {
  const [segIndex, setSegIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const segs = session.segments;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setSegIndex((i) => {
        const next = i + 1;
        if (next >= segs.length) { setPlaying(false); return segs.length - 1; }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, segs.length]);

  const seg = segs[segIndex];
  const chittaColor = CHITTA_COLORS[seg.dominant_chitta] || '#888';
  const gunaTot = (seg.sattva + seg.rajas + seg.tamas) || 1;

  const chakras = useMemo(() => CHAKRA_LIMBS.map((c) => ({
    ...c,
    v: limbValueFromSegment(seg, c.limbKey)
  })), [seg]);

  return (
    <div className="sec">
      <h2>Yogi Map — Chakras · Aṣṭāṅga · Session Animation</h2>

      <div className="cd">
        <div className="desc">
          Seated meditator with the eight limbs of Aṣṭāṅga anchored to the chakra line. Outer and inner petal
          rings spin in opposite directions continuously. Size and glow reflect each limb's score for the
          current 1-second segment.
        </div>

        <div className="brain-controls">
          <div style={{ font: '500 12px JetBrains Mono', color: 'var(--dim)' }}>
            Segment {seg.seg}/{segs.length} · {seg.start}–{seg.end} min
            {seg.sourceLabel ? <span style={{ marginLeft: 8, color: 'var(--accent)' }}>· {seg.sourceLabel}</span> : null}
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="sb"
            style={{ background: playing ? C.red : C.green, color: '#fff', borderColor: 'transparent' }}
          >
            {playing ? '⏸ Pause' : '▶ Play session'}
          </button>
        </div>

        <div className="yogi-layout">
          <div className="yogi-scene">
            <svg
              viewBox="0 0 480 640"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <style>{CHAKRA_CSS}</style>
                <radialGradient id="yogi-aura" cx="50%" cy="45%" r="55%">
                  <stop offset="0%"   stopColor="#f0e4c8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f0e4c8" stopOpacity="0" />
                </radialGradient>
                {/* Glow filter for kundalini sparks */}
                <filter id="kl-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="480" height="640" fill="url(#yogi-aura)" />
              {/* Static channel guide */}
              <line x1="240" y1="48" x2="240" y2="478" stroke="#c8b59a" strokeWidth="1" strokeDasharray="4,6" opacity="0.35" />
              <SeatedFigure />
              {/* Kundalini current rendered AFTER figure so sparks appear over the body */}
              <KundaliniCurrent mds={seg.mds} />
              {chakras.map((c, i) => (
                <ChakraSVG
                  key={c.key}
                  cx={240}
                  cy={c.y}
                  color={c.color}
                  intensity={c.v}
                  label={c.chakra}
                  limb={c.limb}
                  side={i % 2 === 0 ? 'right' : 'left'}
                  spin={c.spin}
                  petals={c.petals}
                  spinDur={c.spinDur}
                  innerDur={c.innerDur}
                />
              ))}
            </svg>
          </div>

          <div className="yogi-side">
            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Chitta Bhūmis</h3>
              <div style={{ marginBottom: 8 }}>
                <span className="pill" style={{ background: chittaColor + '20', color: chittaColor, fontWeight: 600 }}>
                  {seg.dominant_chitta}
                </span>
              </div>
              <MetricBar label="Kṣipta"   value={seg.kshipta}   color={CHITTA_COLORS['Kṣipta']} />
              <MetricBar label="Vikṣipta" value={seg.vikshipta} color={CHITTA_COLORS['Vikṣipta']} />
              <MetricBar label="Ekāgra"   value={seg.ekagra}    color={CHITTA_COLORS['Ekāgra']} />
              <MetricBar label="Niruddha" value={seg.niruddha}  color={CHITTA_COLORS['Niruddha']} />
            </div>

            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Aṣṭāṅga Inner Limbs</h3>
              <MetricBar label="Pratyāhāra" value={seg.pratyahara} color={C.teal} />
              <MetricBar label="Dhāraṇā"    value={seg.dharana}    color={C.blue} />
              <MetricBar label="Dhyāna"     value={seg.dhyana}     color={C.green} />
              <MetricBar label="Savitarka"  value={seg.savitarka}  color={C.purple} />
            </div>

            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Composite Metrics</h3>
              <MetricBar label="MDS — Meditation Depth" value={seg.mds}                       color={C.green} />
              <MetricBar label="Effort (HR rise)"       value={seg.effort * 2}                color={C.amber} />
              <MetricBar label="FAI symmetry"            value={seg.fai}                       color={C.blue} />
              <MetricBar label="α stability (1 − cv)"    value={clamp(1 - seg.cv_alpha, 0, 1)} color={C.purple} />
            </div>

            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Guṇa Dynamics</h3>
              <MetricBar label="Sattva" value={seg.sattva / gunaTot} color={C.green}   showPct />
              <MetricBar label="Rajas"  value={seg.rajas  / gunaTot} color={C.red}     showPct />
              <MetricBar label="Tamas"  value={seg.tamas  / gunaTot} color="#8a857e"   showPct />
            </div>
          </div>
        </div>

        <div className="brain-timeline">
          <input
            type="range"
            min="0"
            max={segs.length - 1}
            value={segIndex}
            onChange={(e) => { setPlaying(false); setSegIndex(Number(e.target.value)); }}
            style={{ width: '100%' }}
          />
          <div className="bt-labels">
            <span>Start</span>
            <span>α {seg.alpha.toFixed(3)} · β {seg.beta.toFixed(3)} · θ {seg.theta.toFixed(3)} · HR {seg.hr_avg}</span>
            <span>End</span>
          </div>
        </div>
      </div>

      <div className="cd">
        <h3>Chakra → Limb Map</h3>
        <div className="g3">
          {CHAKRA_LIMBS.map((c) => (
            <div key={c.key} style={{ padding: 10, background: '#faf8f4', borderRadius: 8, borderLeft: `4px solid ${c.color}` }}>
              <div style={{ font: '600 13px DM Sans', color: c.color }}>{c.chakra}</div>
              <div style={{ font: '400 11px/1.4 DM Sans', color: 'var(--dim)' }}>{c.limb}{c.limbKey ? ' · computed' : ' · ethical base'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
