import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { C } from '../../scripts/constants.js';

const BAND_META = [
  { key: 'delta', label: 'δ Delta', color: '#7048b8' },
  { key: 'theta', label: 'θ Theta', color: C.teal },
  { key: 'alpha', label: 'α Alpha', color: C.green },
  { key: 'beta', label: 'β Beta', color: C.amber },
  { key: 'gamma', label: 'γ Gamma', color: C.red }
];

const ELECTRODES = [
  { name: 'TP9',  pos: [-1.05,  0.10, -0.45], short: 'left temporal' },
  { name: 'AF7',  pos: [-0.55,  0.95,  0.65], short: 'left frontal' },
  { name: 'AF8',  pos: [ 0.55,  0.95,  0.65], short: 'right frontal' },
  { name: 'TP10', pos: [ 1.05,  0.10, -0.45], short: 'right temporal' }
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));

function bandFromSegment(seg, band) {
  return seg[band] ?? 0;
}

function Head() {
  return (
    <mesh>
      <sphereGeometry args={[1.15, 48, 48]} />
      <meshPhongMaterial color="#e8dfcb" transparent opacity={0.30} shininess={10} />
    </mesh>
  );
}

function Cortex() {
  return (
    <mesh>
      <sphereGeometry args={[1.08, 48, 48]} />
      <meshPhongMaterial color="#d48c2a" transparent opacity={0.10} wireframe />
    </mesh>
  );
}

function Electrode({ pos, name, level, color, highlight }) {
  const ref = useRef();
  const glow = 0.18 + clamp01(level) * 0.5;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * (2 + level * 6)) * 0.06 * clamp01(level);
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <sphereGeometry args={[glow, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlight ? 1.3 : 0.6}
          transparent
          opacity={0.78}
        />
      </mesh>
      <Text
        position={[0, glow + 0.18, 0]}
        fontSize={0.13}
        color="#3a3632"
        anchorX="center"
        anchorY="bottom"
      >
        {name}
      </Text>
    </group>
  );
}

function Scene({ session, segIndex, band }) {
  const segs = session.segments;
  const seg = segs[Math.min(segIndex, segs.length - 1)];
  const meta = BAND_META.find((b) => b.key === band);

  // For per-location fallback, we don't have AF7/AF8 band splits per segment,
  // so drive overall magnitude from the segment band and light all four electrodes.
  const mag = Math.min(1, Math.abs(bandFromSegment(seg, band)) * 6);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 4, 4]} intensity={0.9} />
      <pointLight position={[-4, -3, -3]} intensity={0.3} color="#7048b8" />
      <Head />
      <Cortex />
      {ELECTRODES.map((e) => (
        <Electrode
          key={e.name}
          pos={e.pos}
          name={e.name}
          level={mag}
          color={meta.color}
          highlight={
            (band === 'alpha' && (e.name === 'TP9' || e.name === 'TP10')) ||
            ((band === 'beta' || band === 'gamma') && (e.name === 'AF7' || e.name === 'AF8'))
          }
        />
      ))}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={7} />
    </>
  );
}

export default function BrainTab({ session }) {
  const [segIndex, setSegIndex] = useState(0);
  const [band, setBand] = useState('alpha');
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
    }, 1200);
    return () => clearInterval(id);
  }, [playing, segs.length]);

  const seg = segs[segIndex];
  const meta = BAND_META.find((b) => b.key === band);

  const bandCards = useMemo(() => BAND_META.map((b) => ({
    ...b,
    value: (seg[b.key] ?? 0).toFixed(3)
  })), [seg]);

  return (
    <div className="sec">
      <h2>3D Brain — Session Animation</h2>
      <div className="cd">
        <div className="desc">
          Semi-transparent head with the four Muse S electrodes (TP9, AF7, AF8, TP10). Each electrode pulses with
          the selected band’s magnitude for the current ~5-minute segment. Drag to orbit; scroll to zoom.
        </div>

        <div className="brain-controls">
          <div className="bc-bands">
            {BAND_META.map((b) => (
              <button
                key={b.key}
                onClick={() => setBand(b.key)}
                className={`bc-band ${band === b.key ? 'a' : ''}`}
                style={band === b.key ? { background: b.color + '20', borderColor: b.color, color: b.color } : undefined}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="bc-play">
            <button onClick={() => setPlaying((p) => !p)} className="sb" style={{ background: playing ? C.red : C.green, color: '#fff', borderColor: 'transparent' }}>
              {playing ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        <div className="brain-scene">
          <Canvas camera={{ position: [0, 0.4, 4.2], fov: 50 }}>
            <Suspense fallback={null}>
              <Scene session={session} segIndex={segIndex} band={band} />
            </Suspense>
          </Canvas>
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
            <span>Seg {seg.seg} · {seg.start}–{seg.end}m</span>
            <span className="pill" style={{ background: meta.color + '20', color: meta.color }}>
              {meta.label}: {(seg[band] ?? 0).toFixed(3)}
            </span>
            <span>{seg.dominant_chitta}</span>
          </div>
        </div>

        <div className="g3" style={{ marginTop: 16 }}>
          {bandCards.map((b) => (
            <div key={b.key} className="cd" style={{ borderLeft: `4px solid ${b.color}`, margin: 0, padding: 12 }}>
              <div style={{ font: '500 10px JetBrains Mono', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1 }}>{b.label}</div>
              <div style={{ font: '600 20px JetBrains Mono', color: b.color, marginTop: 4 }}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cd">
        <h3>Interpretation notes</h3>
        <ul style={{ paddingLeft: 20, font: '400 13px/1.8 DM Sans', color: 'var(--text)' }}>
          <li><strong>Alpha (α)</strong> — highlighted on posterior TP9/TP10: the default-mode-network proxy.</li>
          <li><strong>Beta/Gamma (β, γ)</strong> — highlighted on frontal AF7/AF8: attention and high-frequency binding.</li>
          <li><strong>Theta (θ)</strong> — frontocentral θ (AF7/AF8) marks Fm-theta, characteristic of dhāraṇā and working memory.</li>
          <li><strong>Delta (δ)</strong> — if dominant during waking meditation, check for drowsiness or local-sleep (Yoga Nidra) signatures.</li>
        </ul>
      </div>
    </div>
  );
}
