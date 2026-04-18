import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'results');
mkdirSync(outDir, { recursive: true });

const tests = [
  'testMathHelpers.mjs',
  'testCsvParsing.mjs',
  'testMetrics.mjs'
];

const summary = [];
let anyFail = false;

for (const t of tests) {
  console.log(`\n=== Running ${t} ===`);
  const r = spawnSync(process.execPath, [join(__dirname, t)], { stdio: 'inherit' });
  summary.push({ test: t, exit: r.status ?? -1 });
  if (r.status !== 0) anyFail = true;
}

writeFileSync(join(outDir, 'summary.json'), JSON.stringify({ summary, overall: anyFail ? 'fail' : 'pass' }, null, 2));
console.log(`\nOverall: ${anyFail ? 'FAIL' : 'PASS'}`);
process.exit(anyFail ? 1 : 0);
