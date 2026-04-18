import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { C, CHITTA_COLORS } from '../../scripts/constants.js';
import { clamp } from '../../scripts/mathHelpers.js';

// Aṣṭāṅga limbs mapped to seven chakras + crown point.
// y coordinate runs from Mūlādhāra at the base to Bindu above the crown.
const CHAKRA_LIMBS = [
  { key: 'yama',       limb: 'Yama',       chakra: 'Mūlādhāra',    color: '#c04a8a', y: -0.20, limbKey: null },
  { key: 'niyama',     limb: 'Niyama',     chakra: 'Svādhiṣṭhāna', color: '#dc4a3a', y:  0.20, limbKey: null },
  { key: 'asana',      limb: 'Āsana',      chakra: 'Maṇipūra',     color: '#d48c2a', y:  0.60, limbKey: 'stillness' },
  { key: 'pranayama',  limb: 'Prāṇāyāma',  chakra: 'Anāhata',      color: '#2a8c5a', y:  1.00, limbKey: 'breath' },
  { key: 'pratyahara', limb: 'Pratyāhāra', chakra: 'Viśuddha',      color: '#1a8a8a', y:  1.40, limbKey: 'pratyahara' },
  { key: 'dharana',    limb: 'Dhāraṇā',    chakra: 'Ājñā',          color: '#3672b8', y:  1.70, limbKey: 'dharana' },
  { key: 'dhyana',     limb: 'Dhyāna',     chakra: 'Sahasrāra',     color: '#7048b8', y:  1.95, limbKey: 'dhyana' },
  { key: 'samadhi',    limb: 'Samādhi',    chakra: 'Bindu',         color: '#c8850a', y:  2.18, limbKey: 'mds' }
];

function SeatedFigure() {
  // Simplified seated meditator: torso + head, folded legs as a low base.
  return (
    <group>
      {/* Base cushion */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.20, 32]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
      </mesh>
      {/* Folded legs */}
      <mesh position={[0, -0.30, 0]}>
        <torusGeometry args={[0.70, 0.22, 16, 32]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      {/* Lower torso */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.38, 0.48, 0.50, 24]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      {/* Upper torso */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.34, 0.38, 0.50, 24]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.40, 24, 24]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      {/* Arms resting in mudra */}
      <mesh position={[-0.45, 0.55, 0.15]} rotation={[0.3, 0, -0.8]}>
        <capsuleGeometry args={[0.10, 0.55, 8, 16]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      <mesh position={[0.45, 0.55, 0.15]} rotation={[0.3, 0, 0.8]}>
        <capsuleGeometry args={[0.10, 0.55, 8, 16]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.18, 16]} />
        <meshStandardMaterial color="#3a3632" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
    </group>
  );
}

function Chakra({ y, color, intensity, label, limb }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * (1.5 + intensity * 4)) * 0.08 * intensity;
    ref.current.scale.setScalar(pulse);
  });
  const size = 0.14 + intensity * 0.14;
  return (
    <group position={[0, y, 0.42]}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4 + intensity * 1.6}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Halo */}
      <mesh>
        <ringGeometry args={[size + 0.05, size + 0.05 + intensity * 0.35, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.12 + intensity * 0.35} side={2} />
      </mesh>
      <Text position={[0.55, 0, 0]} fontSize={0.11} color={color} anchorX="left" anchorY="middle">
        {label}
      </Text>
      <Text position={[0.55, -0.12, 0]} fontSize={0.085} color="#6a6560" anchorX="left" anchorY="middle">
        {limb}
      </Text>
    </group>
  );
}

function limbValueFromSegment(seg, session, limbKey) {
  if (!limbKey) return 0;
  if (limbKey === 'stillness') return clamp(1 - seg.gyro_avg / 10, 0, 1);
  if (limbKey === 'breath')    return clamp(1 - seg.blink_rate / 20, 0, 1);
  return clamp(seg[limbKey] ?? 0, 0, 1);
}

function YogiScene({ session, segIndex }) {
  const seg = session.segments[Math.min(segIndex, session.segments.length - 1)];

  const limbVals = useMemo(() => CHAKRA_LIMBS.map((c) => ({
    ...c,
    v: limbValueFromSegment(seg, session, c.limbKey)
  })), [seg, session]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 5, 4]} intensity={1.0} />
      <pointLight position={[-4, -2, -3]} intensity={0.35} color="#7048b8" />
      <SeatedFigure />
      {limbVals.map((c) => (
        <Chakra key={c.key} y={c.y} color={c.color} intensity={c.v} label={c.chakra} limb={c.limb} />
      ))}
      <OrbitControls enablePan={false} minDistance={3.5} maxDistance={8} target={[0, 0.8, 0]} />
    </>
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
        if (next >= segs.length) {
          setPlaying(false);
          return segs.length - 1;
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [playing, segs.length]);

  const seg = segs[segIndex];
  const chittaColor = CHITTA_COLORS[seg.dominant_chitta] || '#888';
  const gunaTot = (seg.sattva + seg.rajas + seg.tamas) || 1;

  return (
    <div className="sec">
      <h2>3D Yogi — Chakras · Aṣṭāṅga · Session Animation</h2>

      <div className="cd">
        <div className="desc">
          Seated meditator with the eight limbs of Aṣṭāṅga anchored to the chakra line. Each chakra glows with
          its limb’s score for the current segment. Press play to animate the full session alongside live
          Chitta Bhūmis, Aṣṭāṅga limbs, composite metrics, and guṇa dynamics.
        </div>

        <div className="brain-controls">
          <div style={{ font: '500 12px JetBrains Mono', color: 'var(--dim)' }}>
            Segment {seg.seg}/{segs.length} · {seg.start}–{seg.end} min
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
            <Canvas camera={{ position: [2.6, 1.4, 4.2], fov: 45 }}>
              <Suspense fallback={null}>
                <YogiScene session={session} segIndex={segIndex} />
              </Suspense>
            </Canvas>
          </div>

          <div className="yogi-side">
            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Chitta Bhūmis</h3>
              <div style={{ marginBottom: 8 }}>
                <span className="pill" style={{ background: chittaColor + '20', color: chittaColor, fontWeight: 600 }}>
                  {seg.dominant_chitta}
                </span>
              </div>
              <MetricBar label="Kṣipta" value={seg.kshipta} color={CHITTA_COLORS['Kṣipta']} />
              <MetricBar label="Vikṣipta" value={seg.vikshipta} color={CHITTA_COLORS['Vikṣipta']} />
              <MetricBar label="Ekāgra" value={seg.ekagra} color={CHITTA_COLORS['Ekāgra']} />
              <MetricBar label="Niruddha" value={seg.niruddha} color={CHITTA_COLORS['Niruddha']} />
            </div>

            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Aṣṭāṅga Inner Limbs</h3>
              <MetricBar label="Pratyāhāra" value={seg.pratyahara} color={C.teal} />
              <MetricBar label="Dhāraṇā" value={seg.dharana} color={C.blue} />
              <MetricBar label="Dhyāna" value={seg.dhyana} color={C.green} />
              <MetricBar label="Savitarka" value={seg.savitarka} color={C.purple} />
            </div>

            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Composite Metrics</h3>
              <MetricBar label="MDS — Meditation Depth" value={seg.mds} color={C.green} />
              <MetricBar label="Effort (HR rise)" value={seg.effort * 2} color={C.amber} />
              <MetricBar label="FAI symmetry" value={seg.fai} color={C.blue} />
              <MetricBar label="α stability (1 − cv)" value={clamp(1 - seg.cv_alpha, 0, 1)} color={C.purple} />
            </div>

            <div className="cd" style={{ margin: 0, padding: 14 }}>
              <h3>Guṇa Dynamics</h3>
              <MetricBar label="Sattva" value={seg.sattva / gunaTot} color={C.green} showPct />
              <MetricBar label="Rajas"  value={seg.rajas  / gunaTot} color={C.red}   showPct />
              <MetricBar label="Tamas"  value={seg.tamas  / gunaTot} color="#8a857e" showPct />
            </div>
          </div>
        </div>

        <div className="brain-timeline">
          <input
            type="range"
            min="0"
            max={segs.length - 1}
            value={segIndex}
            onChange={(e) => setSegIndex(Number(e.target.value))}
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
