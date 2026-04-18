import { TAB_LIST } from '../scripts/constants.js';

export default function TabBar({ active, onSelect }) {
  return (
    <div className="tabs">
      {TAB_LIST.map((t) => (
        <button
          key={t.id}
          className={`tab${t.id === active ? ' a' : ''}`}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
