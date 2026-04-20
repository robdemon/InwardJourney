import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import './scripts/chartSetup.js';
import { parseMindMonitorCsv, parseMindMonitorString } from './scripts/csvParser.js';
import { buildSession, combineSessions } from './scripts/metrics.js';
import { TAB_LIST } from './scripts/constants.js';
import Header from './components/Header.jsx';
import UploadZone from './components/UploadZone.jsx';
import SessionBar from './components/SessionBar.jsx';
import TabBar from './components/TabBar.jsx';
import StatsRow from './components/StatsRow.jsx';
import YogicStatesTab from './components/tabs/YogicStatesTab.jsx';
import SamkhyaTab from './components/tabs/SamkhyaTab.jsx';
import PatanjaliTab from './components/tabs/PatanjaliTab.jsx';
import KashmirTab from './components/tabs/KashmirTab.jsx';
import BuddhismTab from './components/tabs/BuddhismTab.jsx';
import JainismTab from './components/tabs/JainismTab.jsx';
import SikhismTab from './components/tabs/SikhismTab.jsx';
import TaoismTab from './components/tabs/TaoismTab.jsx';
import ConclusionTab from './components/tabs/ConclusionTab.jsx';

const BrainTab = lazy(() => import('./components/tabs/BrainTab.jsx'));
const YogiTab = lazy(() => import('./components/tabs/YogiTab.jsx'));

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [tab, setTab] = useState('yogic');
  const [status, setStatus] = useState({ message: '', loaded: false });

  const loadSample = async () => {
    try {
      setStatus({ message: 'Loading sample session…', loaded: false });
      const res = await fetch(import.meta.env.BASE_URL + 'sample.csv');
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const text = await res.text();
      const parsed = parseMindMonitorString(text, 'Sample — 2026-03-25');
      const session = buildSession(parsed);
      setSessions([session]);
      setCurrent(0);
      setStatus({ message: `Loaded: ${session.label}`, loaded: true });
    } catch (err) {
      console.error(err);
      setStatus({ message: `Error: ${err.message}`, loaded: false });
    }
  };

  const onFiles = async (files) => {
    try {
      setStatus({ message: `Parsing ${files.length} file${files.length > 1 ? 's' : ''}…`, loaded: false });
      const added = [];
      for (const file of files) {
        const parsed = await parseMindMonitorCsv(file);
        added.push(buildSession(parsed));
      }
      setSessions((prev) => [...prev, ...added]);
      setCurrent(0);
      setStatus({
        message: added.length === 1
          ? `Loaded: ${added[0].label}`
          : `Loaded ${added.length} sessions`,
        loaded: true
      });
    } catch (err) {
      console.error(err);
      setStatus({ message: `Error: ${err.message}`, loaded: false });
    }
  };

  const viewSessions = useMemo(() => (
    sessions.length > 1 ? [combineSessions(sessions), ...sessions] : sessions
  ), [sessions]);

  const active = viewSessions[current];

  const panel = useMemo(() => {
    if (!active) return null;
    switch (tab) {
      case 'yogic': return <YogicStatesTab session={active} />;
      case 'samkhya': return <SamkhyaTab session={active} />;
      case 'patanjali': return <PatanjaliTab session={active} />;
      case 'kashmir': return <KashmirTab session={active} />;
      case 'buddhism': return <BuddhismTab session={active} />;
      case 'jainism': return <JainismTab session={active} />;
      case 'sikhism': return <SikhismTab session={active} />;
      case 'taoism': return <TaoismTab session={active} />;
      case 'brain': return (
        <Suspense fallback={<div className="cd">Loading 3D scene…</div>}>
          <BrainTab session={active} />
        </Suspense>
      );
      case 'yogi3d': return (
        <Suspense fallback={<div className="cd">Loading 3D scene…</div>}>
          <YogiTab session={active} />
        </Suspense>
      );
      case 'conclusion': return <ConclusionTab session={active} />;
      default: return null;
    }
  }, [tab, active]);

  useEffect(() => {
    if (!TAB_LIST.some((t) => t.id === tab)) setTab('yogic');
  }, [tab]);

  return (
    <div className="ctr">
      <Header />
      <UploadZone onFiles={onFiles} onSample={loadSample} status={status} />
      {viewSessions.length > 0 && (
        <>
          <SessionBar sessions={viewSessions} current={current} onSelect={setCurrent} />
          <TabBar active={tab} onSelect={setTab} />
          {active && <StatsRow session={active} />}
          <div>{panel}</div>
        </>
      )}
      {sessions.length === 0 && (
        <div className="landing">
          <div className="glyph">☸</div>
          <p>Upload a Mind Monitor CSV to see EEG × yogic-framework analysis for your meditation session. All processing happens locally in your browser.</p>
        </div>
      )}
    </div>
  );
}
