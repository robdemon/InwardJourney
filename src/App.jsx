import { useEffect, useMemo, useState } from 'react';
import './scripts/chartSetup.js';
import { parseMindMonitorCsv } from './scripts/csvParser.js';
import { buildSession } from './scripts/metrics.js';
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

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [tab, setTab] = useState('yogic');
  const [status, setStatus] = useState({ message: '', loaded: false });

  const onFile = async (file) => {
    try {
      setStatus({ message: `Parsing ${file.name}…`, loaded: false });
      const parsed = await parseMindMonitorCsv(file);
      const session = buildSession(parsed);
      setSessions((prev) => [...prev, session]);
      setCurrent(sessions.length);
      setStatus({ message: `Loaded: ${session.label}`, loaded: true });
    } catch (err) {
      console.error(err);
      setStatus({ message: `Error: ${err.message}`, loaded: false });
    }
  };

  const active = sessions[current];

  const panel = useMemo(() => {
    if (!active) return null;
    switch (tab) {
      case 'yogic': return <YogicStatesTab session={active} />;
      case 'samkhya': return <SamkhyaTab session={active} />;
      case 'patanjali': return <PatanjaliTab session={active} />;
      case 'kashmir': return <KashmirTab session={active} />;
      case 'buddhism': return <BuddhismTab />;
      case 'jainism': return <JainismTab />;
      case 'sikhism': return <SikhismTab />;
      case 'taoism': return <TaoismTab />;
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
      <UploadZone onFile={onFile} status={status} />
      {sessions.length > 0 && (
        <>
          <SessionBar sessions={sessions} current={current} onSelect={setCurrent} />
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
