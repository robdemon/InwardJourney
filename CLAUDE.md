# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # install deps (chart.js, react-chartjs-2, papaparse, vite)
npm run dev           # dev server on http://localhost:5173
npm run build         # vite production build to dist/
npm run preview       # preview the built bundle
npm test              # run Node test suite (Test/runAll.mjs)
node Test/testCsvParsing.mjs   # run a single test file directly
```

The three test files are independent; `runAll.mjs` just spawns each and aggregates exit codes into `Test/results/summary.json`. The CSV-parsing and metrics tests iterate over every `.csv` in `Input Data/` — drop a file there and it gets tested automatically on next run.

## Architecture

**Data flow (single direction, no global store):**
`Mind Monitor CSV → csvParser.normalise() → metrics.buildSession() → App.sessions[] → tab components`

1. `src/scripts/csvParser.js` normalises a Mind Monitor CSV into `{ rows, events, t0, sourceName, firstDate }`. `rows` contain per-sample 4-channel averages (TP9+AF7+AF8+TP10 → d/t/a/b/g) plus HR, gyro, and per-location alpha variants. `events` holds OSC markers (`/muse/elements/blink`, `/muse/elements/jaw_clench`, etc.). Two entry points: `parseMindMonitorCsv(File)` for the browser (async, uses PapaParse streaming) and `parseMindMonitorString(text, name)` for Node tests — both funnel through the same `normalise()`.

2. `src/scripts/metrics.js` consumes the normalised shape and produces a **session object**: session-level summary (bands, hr, blink_rate) plus a `segments[]` array (≈5-min windows) carrying composite scores used across all tabs. The segment schema is load-bearing — every tab reads from the same fields (`ekagra`, `mds`, `pratyahara`, `dharana`, `dhyana`, `savitarka`, `rajas`, `tamas`, `sattva`, `fai`, `dominant_chitta`, …). Changes here cascade to every tab component; keep field names stable.

3. `src/App.jsx` holds `sessions[]` in state (multiple CSVs can be loaded and switched via `SessionBar`). The active tab is rendered via a `switch` on `tab` inside a `useMemo`. Adding a tab requires: (a) new entry in `TAB_LIST` in `src/scripts/constants.js`, (b) new case in `App.jsx`'s switch.

**Tab components** live in `src/components/tabs/`:
- `YogicStatesTab`, `SamkhyaTab`, `PatanjaliTab`, `KashmirTab`, `ConclusionTab` — tradition-specific, read directly from `session.segments` and render Chart.js visuals
- `BuddhismTab`, `JainismTab`, `SikhismTab`, `TaoismTab` — thin wrappers around the shared `TraditionTab` template; they pass `title`, `blurb`, `cards`, `references` from `src/data/<tradition>.js`. No session data is consumed here — these tabs are pure knowledge-cards (reference content only).

**Knowledge-card badges:** each card in `src/data/*.js` declares either `badge: 'computed'` (metric we actually derive from CSV) or `badge: 'reference'` (requires data we don't have — fNIRS, raw R-R, ERP sync). This distinction must stay truthful: if you claim `computed`, the number has to come from the session object, not the card description.

**Chart.js registration** is centralised in `src/scripts/chartSetup.js` and side-effect-imported by `App.jsx`. All scale/element/plugin registrations happen there once.

## What's derivable vs. what isn't

Mind Monitor CSV gives band powers, HR, gyro, and coarse event markers — nothing more. Metrics marked `reference` in the knowledge cards (ACW, LZ complexity, Aperiodic 1/f slope, NDA, γ-trait, fNIRS-based PFC coherence) **cannot be computed from this input** and should stay as reference-only formulas. Do not invent values for them. If you need to add a new `computed` metric, verify the inputs exist in `rows[]` first.

## Reference material

- `Research/Temp.html` — original vanilla-JS prototype. The React app ports its behaviour; if a formula seems wrong, diff against `t0()`–`t4()` in Temp.html before changing.
- `Research/*.docx` — source documents behind the knowledge cards. Extracted text lives under the card `body`/`formula` fields in `src/data/*.js`.
- `Input Data/` — real session CSVs used for testing; not synthetic.
