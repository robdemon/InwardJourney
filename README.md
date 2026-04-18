# Inward Journey

Neuro-philosophical meditation analysis dashboard for the Muse S Athena EEG headband. Upload a CSV export from the Mind Monitor mobile app and see your session analysed through eight contemplative traditions.

## Traditions included

- Yogic States (Chitta Bhūmis)
- Sāṃkhya (Guṇas, Puruṣa–Prakṛti)
- Patañjali Yoga Sūtras (Aṣṭāṅga limbs)
- Kashmir Śaivism (Upāyas, Spanda, Pratyabhijñā)
- Buddhism (Shamatha, Vipassana, Zen, Jhāna)
- Jainism (Prekṣā, Kāyotsarga)
- Sikhism (Naam Simran, Kirtan Kriya)
- Taoism / Daoism (Qigong, Tai Chi, Three Treasures)

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle
npm test             # run Test/ suite against CSVs in "Input Data/"
```

## Project layout

```
src/
  components/   React UI: Header, UploadZone, StatsRow, TabBar, tabs/
  scripts/      csvParser, metrics, chitta, ashtanga, gunas, upayas, constants
  styles/       Global + component CSS (separated from JSX)
  data/         Curated knowledge content extracted from Research/*.docx
  assets/       Static images
Test/           Node scripts validating parsing + metric computation
Research/       Source research .docx and the original Temp.html
Input Data/     Sample Mind Monitor CSVs used for local testing
```

## Data source

Mind Monitor CSV (Muse S EEG) exposes per-electrode band powers (δ, θ, α, β, γ at TP9/AF7/AF8/TP10), Heart_Rate, 3-axis gyroscope, and `Elements` event markers (blinks, jaws, OSC events). Metrics requiring fNIRS HbO, raw R-R intervals, or ERP stimulus-sync are shown as reference formulas only — they are not computed from the CSV.

## License

Personal research project. No clinical claims are made; Muse S Athena is a consumer wellness device, not FDA-cleared.
