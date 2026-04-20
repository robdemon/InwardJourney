import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { C } from '../../scripts/constants.js';

const BAND_META = [
  { key: 'delta', label: 'δ Delta', color: '#7048b8' },
  { key: 'theta', label: 'θ Theta', color: C.teal },
  { key: 'alpha', label: 'α Alpha', color: C.green },
  { key: 'beta',  label: 'β Beta',  color: C.amber },
  { key: 'gamma', label: 'γ Gamma', color: C.red }
];

const ELECTRODES = [
  { name: 'TP9',  pos: [-1.05,  0.10, -0.45] },
  { name: 'AF7',  pos: [-0.55,  0.95,  0.65] },
  { name: 'AF8',  pos: [ 0.55,  0.95,  0.65] },
  { name: 'TP10', pos: [ 1.05,  0.10, -0.45] }
];

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
  const fieldRef = useRef();
  const ringRef = useRef();
  const smoothLevel = useRef(level);

  useFrame(() => {
    // Lerp toward current level each frame — no oscillation, just smooth convergence
    smoothLevel.current += (level - smoothLevel.current) * 0.12;
    const l = smoothLevel.current;
    if (fieldRef.current) {
      fieldRef.current.scale.setScalar(0.4 + l * 1.3);
      fieldRef.current.material.opacity = 0.06 + l * 0.22;
    }
    if (ringRef.current) {
      ringRef.current.material.emissiveIntensity = highlight ? 0.7 + l * 1.0 : 0.3 + l * 0.6;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={fieldRef}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.025, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      <Text position={[0, 0.32, 0]} fontSize={0.13} color="#3a3632" anchorX="center" anchorY="bottom">
        {name}
      </Text>
    </group>
  );
}

// Advances segIndex once per second using the WebGL delta timer so playback is
// always in sync with the render loop, avoiding JS-timer drift in Concurrent Mode.
function PlaybackTimer({ playing, segCount, onAdvance }) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (!playing) { elapsed.current = 0; return; }
    elapsed.current += delta;
    if (elapsed.current >= 1.0) {
      elapsed.current -= 1.0;
      onAdvance();
    }
  });
  return null;
}

function Scene({ session, segIndex, band, playing, onAdvance }) {
  const segs = session.segments;
  const seg = segs[Math.min(segIndex, segs.length - 1)];
  const meta = BAND_META.find((b) => b.key === band);
  const mag = Math.min(1, Math.abs((seg[band] ?? 0)) * 6);

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
      <PlaybackTimer playing={playing} segCount={segs.length} onAdvance={onAdvance} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={7} />
    </>
  );
}

export default function BrainTab({ session }) {
  const [segIndex, setSegIndex] = useState(0);
  const [band, setBand] = useState('alpha');
  const [playing, setPlaying] = useState(false);
  const segs = session.segments;

  const onAdvance = useCallback(() => {
    setSegIndex((i) => {
      const next = i + 1;
      if (next >= segs.length) { setPlaying(false); return segs.length - 1; }
      return next;
    });
  }, [segs.length]);

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
          Semi-transparent head with the four Muse S electrodes (TP9, AF7, AF8, TP10) shown as ring markers.
          Each electrode's activity field smoothly expands and brightens with the selected band's magnitude.
          Drag to orbit; scroll to zoom.
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
            <button
              onClick={() => setPlaying((p) => !p)}
              className="sb"
              style={{ background: playing ? C.red : C.green, color: '#fff', borderColor: 'transparent' }}
            >
              {playing ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        <div className="brain-scene">
          <Canvas camera={{ position: [0, 0.4, 4.2], fov: 50 }}>
            <Suspense fallback={null}>
              <Scene
                session={session}
                segIndex={segIndex}
                band={band}
                playing={playing}
                onAdvance={onAdvance}
              />
            </Suspense>
          </Canvas>
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
            <span>
              Seg {seg.seg} · {seg.start}–{seg.end}m
              {seg.sourceLabel ? <span style={{ marginLeft: 6, color: 'var(--accent)' }}>· {seg.sourceLabel}</span> : null}
            </span>
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
