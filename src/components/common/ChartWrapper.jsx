const CHART_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#6a655e', font: { size: 11, family: 'DM Sans' } } }
  },
  scales: {
    x: { grid: { color: '#eae7e1' }, ticks: { color: '#6a655e', font: { size: 10, family: 'DM Sans' } } },
    y: { grid: { color: '#eae7e1' }, ticks: { color: '#6a655e', font: { size: 10, family: 'DM Sans' } } }
  }
};

const RADAR_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#6a655e', font: { size: 11, family: 'DM Sans' } } }
  },
  scales: {
    r: {
      grid: { color: '#e0ddd6' },
      pointLabels: { color: '#5a554e', font: { size: 11, family: 'DM Sans' } },
      ticks: { display: false }
    }
  }
};

/** Deep-merge Chart.js options onto a base. Good enough for the shapes we use. */
export function mergeOptions(base, extra) {
  if (!extra) return base;
  const out = { ...base };
  for (const k of Object.keys(extra)) {
    const v = extra[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = mergeOptions(base[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function chartOptions(type, extra) {
  const base = type === 'radar' || type === 'doughnut' || type === 'pie'
    ? (type === 'radar' ? RADAR_BASE : { responsive: true, maintainAspectRatio: false })
    : CHART_BASE;
  return mergeOptions(base, extra);
}

export default function ChartWrapper({ children, className = '' }) {
  return <div className={`cw ${className}`}>{children}</div>;
}
