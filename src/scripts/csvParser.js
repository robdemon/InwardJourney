import Papa from 'papaparse';

/**
 * Parse a Mind Monitor CSV File/Blob. Resolves with the normalised
 * shape used downstream: { rows, events, t0, sourceName, firstDate }.
 *
 * Rows contain per-sample 4-channel band averages + heart rate + gyro.
 * Events contain OSC markers (blink, jaw, connected, etc.).
 */
export function parseMindMonitorCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (r) => {
        try {
          resolve(normalise(r.data, file?.name ?? 'session'));
        } catch (err) {
          reject(err);
        }
      },
      error: reject
    });
  });
}

/** Parse CSV content already loaded as a string (used by Node-based tests). */
export function parseMindMonitorString(text, sourceName = 'session') {
  const r = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return normalise(r.data, sourceName);
}

function normalise(raw, sourceName) {
  const rows = [];
  const events = [];
  let t0 = null;
  let firstDate = '';

  for (const row of raw) {
    const el = row.Elements || '';
    if (el && String(el).startsWith('/muse/')) {
      events.push({ time: row.TimeStamp, event: el });
      continue;
    }
    if (row.Delta_TP9 == null) continue;

    const d = (row.Delta_TP9 + row.Delta_AF7 + row.Delta_AF8 + row.Delta_TP10) / 4;
    const th = (row.Theta_TP9 + row.Theta_AF7 + row.Theta_AF8 + row.Theta_TP10) / 4;
    const a = (row.Alpha_TP9 + row.Alpha_AF7 + row.Alpha_AF8 + row.Alpha_TP10) / 4;
    const b = (row.Beta_TP9 + row.Beta_AF7 + row.Beta_AF8 + row.Beta_TP10) / 4;
    const g = (row.Gamma_TP9 + row.Gamma_AF7 + row.Gamma_AF8 + row.Gamma_TP10) / 4;
    if (Number.isNaN(d)) continue;

    const ts = new Date(String(row.TimeStamp).replace(' ', 'T'));
    if (!t0) {
      t0 = ts;
      firstDate = String(row.TimeStamp).split(' ')[0];
    }
    const gy = Math.sqrt(
      Math.pow(row.Gyro_X || 0, 2) + Math.pow(row.Gyro_Y || 0, 2) + Math.pow(row.Gyro_Z || 0, 2)
    );

    rows.push({
      min: +((ts - t0) / 60000).toFixed(3),
      d, t: th, a, b, g,
      hr: row.Heart_Rate || 0,
      gy,
      alpha_tp: (row.Alpha_TP9 + row.Alpha_TP10) / 2,
      alpha_af: (row.Alpha_AF7 + row.Alpha_AF8) / 2,
      alpha_af7: row.Alpha_AF7 || 0,
      alpha_af8: row.Alpha_AF8 || 0,
      theta_af: (row.Theta_AF7 + row.Theta_AF8) / 2,
      beta_af: (row.Beta_AF7 + row.Beta_AF8) / 2
    });
  }

  return { rows, events, t0, sourceName, firstDate };
}
