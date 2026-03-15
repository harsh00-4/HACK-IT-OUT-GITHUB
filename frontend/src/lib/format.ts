export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function fmtNumber(v: number, digits = 2) {
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(digits);
}

