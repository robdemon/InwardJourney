import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMindMonitorString } from '../src/scripts/csvParser.js';
import { buildSession } from '../src/scripts/metrics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputDir = join(__dirname, '..', 'Input Data');
const outDir = join(__dirname, 'results');
mkdirSync(outDir, { recursive: true });

const files = readdirSync(inputDir).filter((f) => f.toLowerCase().endsWith('.csv'));

const report = [];
let pass = 0;
let fail = 0;

const inRange = (x, lo, hi, name) => {
  if (Number.isNaN(x) || x < lo || x > hi) {
    throw new Error(`${name}=${x} outside [${lo}, ${hi}]`);
  }
};

for (const name of files) {
  const raw = readFileSync(join(inputDir, name), 'utf8');
  try {
    const parsed = parseMindMonitorString(raw, name);
    const s = buildSession(parsed);

    if (!s.segments.length) throw new Error('No segments produced');
    if (s.duration <= 0) throw new Error(`duration=${s.duration}`);

    for (const seg of s.segments) {
      inRange(seg.ekagra, 0, 1.5, `ekagra seg${seg.seg}`);
      inRange(seg.mds, 0, 1.5, `mds seg${seg.seg}`);
      inRange(seg.pratyahara, 0, 1.5, `pratyahara seg${seg.seg}`);
      inRange(seg.effort, 0, 1, `effort seg${seg.seg}`);
      if (!['Kṣipta', 'Mūḍha', 'Vikṣipta', 'Ekāgra', 'Niruddha'].includes(seg.dominant_chitta)) {
        throw new Error(`bad dominant_chitta ${seg.dominant_chitta} seg${seg.seg}`);
      }
    }

    report.push({
      file: name,
      label: s.label,
      firstDate: s.firstDate,
      duration: s.duration,
      segments: s.segments.length,
      bands: s.bands,
      blink_rate: s.blink_rate,
      hr_mean: s.hr_mean,
      hr_min: s.hr_min,
      hr_max: s.hr_max,
      dominant_states: s.segments.reduce((acc, seg) => {
        acc[seg.dominant_chitta] = (acc[seg.dominant_chitta] || 0) + 1;
        return acc;
      }, {}),
      status: 'pass'
    });
    pass++;
    console.log(`PASS  ${name}  ${s.duration}m  ${s.segments.length} seg  α=${s.bands.alpha.toFixed(3)}  HR=${s.hr_mean}`);
  } catch (err) {
    report.push({ file: name, status: 'fail', error: err.message });
    fail++;
    console.error(`FAIL  ${name}  ${err.message}`);
  }
}

writeFileSync(join(outDir, 'metrics.json'), JSON.stringify({ pass, fail, total: files.length, report }, null, 2));
console.log(`\nMetrics: ${pass}/${files.length} passed`);
if (fail) process.exit(1);
