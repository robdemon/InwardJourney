import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sigmoid, clamp, mean, std, pickMax } from '../src/scripts/mathHelpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'results');
mkdirSync(outDir, { recursive: true });

const cases = [
  { name: 'sigmoid(0) ≈ 0.5', actual: sigmoid(0), expect: 0.5, eps: 1e-9 },
  { name: 'sigmoid(1) ≈ 0.993', actual: sigmoid(1), expect: 0.9933, eps: 1e-3 },
  { name: 'sigmoid(-1) ≈ 0.0066', actual: sigmoid(-1), expect: 0.00669, eps: 1e-3 },
  { name: 'clamp low', actual: clamp(-5, 0, 10), expect: 0 },
  { name: 'clamp high', actual: clamp(50, 0, 10), expect: 10 },
  { name: 'clamp mid', actual: clamp(5, 0, 10), expect: 5 },
  { name: 'mean basic', actual: mean([1, 2, 3, 4]), expect: 2.5 },
  { name: 'mean empty', actual: mean([]), expect: 0 },
  { name: 'std constant', actual: std([5, 5, 5]), expect: 0 },
  { name: 'pickMax', actual: pickMax({ a: 1, b: 5, c: 3 }), expect: 'b' }
];

const report = [];
let pass = 0;
let fail = 0;

for (const c of cases) {
  const ok = typeof c.actual === 'number' && typeof c.expect === 'number'
    ? Math.abs(c.actual - c.expect) <= (c.eps ?? 1e-9)
    : c.actual === c.expect;
  report.push({ name: c.name, actual: c.actual, expected: c.expect, ok });
  if (ok) {
    pass++;
    console.log(`PASS  ${c.name}`);
  } else {
    fail++;
    console.error(`FAIL  ${c.name}  actual=${c.actual}  expected=${c.expect}`);
  }
}

writeFileSync(join(outDir, 'math.json'), JSON.stringify({ pass, fail, total: cases.length, report }, null, 2));
console.log(`\nMath helpers: ${pass}/${cases.length} passed`);
if (fail) process.exit(1);
