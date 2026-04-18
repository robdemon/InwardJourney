import { sigmoid, clamp, pickMax } from './mathHelpers.js';

/**
 * Build a full session object with per-segment composite scores and a
 * session-level summary. Operates on the normalised shape returned by
 * parseMindMonitorCsv().
 *
 * Segment window is ~5 min, matching the original Temp.html convention.
 */
export function buildSession({ rows, events, t0, sourceName, firstDate }) {
  if (!rows || rows.length < 10) {
    throw new Error('Not enough data rows (need at least 10)');
  }

  const duration = rows[rows.length - 1].min;
  const blinks = events.filter((e) => e.event.includes('blink'));
  const jaws = events.filter((e) => e.event.includes('jaw'));

  const nSeg = Math.max(1, Math.ceil(duration / 5));
  const segSz = Math.floor(rows.length / nSeg);
  const segs = [];

  for (let i = 0; i < nSeg; i++) {
    const sl = rows.slice(i * segSz, Math.min((i + 1) * segSz, rows.length));
    const segAvg = (k) => sl.reduce((acc, r) => acc + (r[k] || 0), 0) / sl.length;
    const segStd = (k) => {
      const m = segAvg(k);
      return Math.sqrt(sl.reduce((acc, r) => acc + Math.pow((r[k] || 0) - m, 2), 0) / sl.length);
    };
    const sMin = sl[0].min;
    const eMin = sl[sl.length - 1].min;

    let blk = 0;
    let jk = 0;
    for (const bk of blinks) {
      const bt = (new Date(String(bk.time).replace(' ', 'T')) - t0) / 60000;
      if (bt >= sMin && bt < eMin) blk++;
    }
    for (const j of jaws) {
      const jt = (new Date(String(j.time).replace(' ', 'T')) - t0) / 60000;
      if (jt >= sMin && jt < eMin) jk++;
    }

    const a = segAvg('a');
    const b = segAvg('b');
    const th = segAvg('t');
    const dd = segAvg('d');
    const g = segAvg('g');
    const hrm = segAvg('hr');
    const gyavg = segAvg('gy');
    const tot = Math.abs(a) + Math.abs(b) + Math.abs(th) + Math.abs(dd) + Math.abs(g);
    const cva = Math.abs(a) > 0.01 ? segStd('a') / Math.abs(a) : 2;
    const br = blk / Math.max(0.1, eMin - sMin);
    const jr = jk / Math.max(0.1, eMin - sMin);

    const hrv = [];
    for (const r of sl) if (r.hr > 0) hrv.push(r.hr);
    const hrMin = hrv.length ? Math.min(...hrv) : 0;
    const hrMax = hrv.length ? Math.max(...hrv) : 0;

    const ba = a > 0 ? Math.abs(b) / Math.max(0.01, Math.abs(a)) : Math.abs(b) * 10;
    const ksh =
      0.35 * clamp(ba / 3, 0, 1) +
      0.25 * clamp(br / 20, 0, 1) +
      0.20 * clamp(gyavg / 50, 0, 1) +
      0.20 * clamp(segStd('hr') / Math.max(1, hrm), 0, 1);

    let mud =
      0.35 * Math.abs(dd) / Math.max(0.01, tot) +
      0.30 * sigmoid(th - a) +
      0.15 * clamp(1 - gyavg / 5, 0, 1) +
      0.20 * sigmoid(65 - hrm);
    if (a > 0.05) mud *= 0.3;

    const cvok = clamp(1 - cva, 0, 1);
    const ek =
      0.25 * (a > Math.max(b, th, g) && a > 0.05 ? 1 : 0) +
      0.25 * cvok +
      0.20 * (b < 0 ? 1 : 0) +
      0.15 * (gyavg < 2 ? 1 : 0) +
      0.15 * (br < 2 ? 1 : 0);
    const vik =
      0.50 * clamp(cva / 2, 0, 1) +
      0.25 * (1 - ksh) +
      0.25 * (1 - ek) * (a < 0.01 ? 0.5 : 1);
    const nir =
      0.30 * (th >= a && a > 0 ? 1 : 0) +
      0.20 * (Math.abs(dd) < 0.1 * Math.abs(th) && Math.abs(th) > 0.01 ? 1 : 0) +
      0.15 * sigmoid(hrm * 0.85 - hrm) +
      0.15 * (gyavg < 0.3 ? 1 : 0);

    const chittaScores = { 'Kṣipta': ksh, 'Mūḍha': mud, 'Vikṣipta': vik, 'Ekāgra': ek, 'Niruddha': nir };
    const dominant = pickMax(chittaScores);

    const pra =
      0.30 * clamp(1 - br / 15, 0, 1) +
      0.15 * clamp(1 - jr / 2, 0, 1) +
      0.25 * clamp(1 - gyavg / 10, 0, 1) +
      0.30 * sigmoid(segAvg('alpha_tp') - segAvg('alpha_af'));

    const hrBase = segs.length > 0 ? segs[0].hr_avg : hrm;
    const eff = clamp((hrm - hrBase) / Math.max(1, hrBase), 0, 0.5);
    const dha = ek > 0.5 && eff > 0.05 ? ek * (1 + eff) : 0;
    const bs = Math.abs(Math.min(0, b));
    let dhy =
      0.25 * cvok +
      0.25 * (1 - eff / 0.5) +
      0.20 * (ek > 0.7 ? 1 : 0) +
      0.15 * bs +
      0.15 * (i > 0 && hrm < segs[i - 1].hr_avg ? 1 : 0);
    if (eff >= 0.05 || ek <= 0.5) dhy *= 0.3;

    const sav =
      0.30 * (th >= 0.8 * a && a > 0.01 ? 1 : 0) +
      0.20 * (dd < th ? 1 : 0) +
      0.20 * clamp(1 - Math.abs(segAvg('beta_af')), 0, 1) +
      0.15 * (hrm < hrBase * 0.9 ? 1 : 0);

    const mds =
      0.25 * clamp(a, 0, 1) +
      0.20 * clamp(cvok, 0, 1) +
      0.15 * clamp(bs, 0, 1) +
      0.15 * clamp(1 - gyavg / 50, 0, 1) +
      0.10 * clamp(1 - br / 20, 0, 1) +
      0.10 * clamp(1 - (hrMax - hrMin) / Math.max(1, hrm), 0, 1) +
      0.05 * clamp(Math.abs(Math.min(0, g)), 0, 1);

    const rajas =
      0.4 * Math.max(0, b) / Math.max(0.01, tot) +
      0.2 * br / 20 +
      0.2 * gyavg / 20 +
      0.2 * clamp((hrm - 60) / 40, 0, 1);
    const tamas =
      0.5 * Math.max(0, dd) / Math.max(0.01, tot) * (a < 0.05 ? 1 : 0.3) +
      0.3 * Math.max(0, 1 - a);
    const sattva =
      0.35 * Math.max(0, a) / Math.max(0.01, tot) +
      0.25 * bs / Math.max(0.01, tot) +
      0.2 * cvok +
      0.2 * clamp(1 - gyavg / 10, 0, 1);

    const af7 = segAvg('alpha_af7');
    const af8 = segAvg('alpha_af8');
    const fai = 1 - Math.abs(af8 - af7) / (Math.abs(af8) + Math.abs(af7) + 0.001);

    let gyMax = 0;
    for (const r of sl) if (r.gy > gyMax) gyMax = r.gy;

    segs.push({
      seg: i + 1,
      start: +sMin.toFixed(1),
      end: +eMin.toFixed(1),
      delta: +dd.toFixed(4),
      theta: +th.toFixed(4),
      alpha: +a.toFixed(4),
      beta: +b.toFixed(4),
      gamma: +g.toFixed(4),
      hr_avg: +hrm.toFixed(1),
      hr_min: +hrMin.toFixed(1),
      hr_max: +hrMax.toFixed(1),
      hr_std: +segStd('hr').toFixed(2),
      gyro_avg: +gyavg.toFixed(2),
      gyro_max: +gyMax.toFixed(1),
      blinks: blk,
      jaws: jk,
      blink_rate: +br.toFixed(1),
      cv_alpha: +cva.toFixed(3),
      alpha_pct: +(Math.abs(a) / tot * 100).toFixed(1),
      fai: +fai.toFixed(3),
      kshipta: +ksh.toFixed(3),
      mudha: +mud.toFixed(3),
      vikshipta: +vik.toFixed(3),
      ekagra: +ek.toFixed(3),
      niruddha: +nir.toFixed(3),
      dominant_chitta: dominant,
      pratyahara: +pra.toFixed(3),
      dharana: +dha.toFixed(3),
      dhyana: +dhy.toFixed(3),
      savitarka: +sav.toFixed(3),
      effort: +eff.toFixed(3),
      mds: +mds.toFixed(3),
      rajas: +rajas.toFixed(3),
      tamas: +tamas.toFixed(3),
      sattva: +sattva.toFixed(3)
    });
  }

  const rowAvg = (k) => rows.reduce((acc, r) => acc + (r[k] || 0), 0) / rows.length;
  let betaNeg = 0;
  let gammaNeg = 0;
  for (const r of rows) {
    if (r.b < 0) betaNeg++;
    if (r.g < 0) gammaNeg++;
  }
  const hrAll = rows.map((r) => r.hr).filter((h) => h > 0);

  return {
    label: sourceName.replace(/\.csv$/i, ''),
    firstDate,
    duration: +duration.toFixed(1),
    n_rows: rows.length,
    blinks: blinks.length,
    jaws: jaws.length,
    blink_rate: +(blinks.length / duration).toFixed(1),
    hr_mean: +rowAvg('hr').toFixed(1),
    hr_min: hrAll.length ? +Math.min(...hrAll).toFixed(1) : 0,
    hr_max: hrAll.length ? +Math.max(...hrAll).toFixed(1) : 0,
    bands: {
      delta: +rowAvg('d').toFixed(4),
      theta: +rowAvg('t').toFixed(4),
      alpha: +rowAvg('a').toFixed(4),
      beta: +rowAvg('b').toFixed(4),
      gamma: +rowAvg('g').toFixed(4)
    },
    segments: segs,
    beta_neg_pct: +(betaNeg / rows.length * 100).toFixed(1),
    gamma_neg_pct: +(gammaNeg / rows.length * 100).toFixed(1)
  };
}

/** Convenience wrappers used across several tabs. */
export const segMean = (segs, key) => segs.reduce((a, s) => a + s[key], 0) / segs.length;
