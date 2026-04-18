export function sigmoid(x) {
  return 1 / (1 + Math.exp(-5 * Math.max(-10, Math.min(10, x))));
}

export function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

export function mean(arr) {
  if (!arr.length) return 0;
  let s = 0;
  for (const v of arr) s += v || 0;
  return s / arr.length;
}

export function std(arr) {
  if (!arr.length) return 0;
  const m = mean(arr);
  let s = 0;
  for (const v of arr) s += Math.pow((v || 0) - m, 2);
  return Math.sqrt(s / arr.length);
}

export function pickMax(obj) {
  return Object.entries(obj).sort(([, a], [, b]) => b - a)[0][0];
}
