import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMindMonitorString } from '../src/scripts/csvParser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputDir = join(__dirname, '..', 'Input Data');
const outDir = join(__dirname, 'results');
mkdirSync(outDir, { recursive: true });

const files = readdirSync(inputDir).filter((f) => f.toLowerCase().endsWith('.csv'));

const report = [];
let pass = 0;
let fail = 0;

for (const name of files) {
  const raw = readFileSync(join(inputDir, name), 'utf8');
  try {
    const parsed = parseMindMonitorString(raw, name);
    const row = parsed.rows[0];
    const last = parsed.rows[parsed.rows.length - 1];
    const requiredKeys = ['min', 'd', 't', 'a', 'b', 'g', 'hr', 'gy', 'alpha_tp', 'alpha_af', 'alpha_af7', 'alpha_af8'];
    const missing = requiredKeys.filter((k) => row[k] === undefined);
    if (missing.length) throw new Error(`Missing keys on row 0: ${missing.join(', ')}`);
    if (!parsed.t0) throw new Error('No t0 (timestamp) found');
    if (!(last.min > 0)) throw new Error('Duration is zero');

    report.push({
      file: name,
      rows: parsed.rows.length,
      events: parsed.events.length,
      firstDate: parsed.firstDate,
      duration_min: +last.min.toFixed(2),
      status: 'pass'
    });
    pass++;
    console.log(`PASS  ${name}  rows=${parsed.rows.length}  events=${parsed.events.length}  duration=${last.min.toFixed(2)}m`);
  } catch (err) {
    report.push({ file: name, status: 'fail', error: err.message });
    fail++;
    console.error(`FAIL  ${name}  ${err.message}`);
  }
}

writeFileSync(join(outDir, 'csv_parsing.json'), JSON.stringify({ pass, fail, total: files.length, report }, null, 2));
console.log(`\nCSV parsing: ${pass}/${files.length} passed`);
if (fail) process.exit(1);
