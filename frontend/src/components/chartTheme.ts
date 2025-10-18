// Shared, uncluttered chart styling helpers
export const gridStroke = "rgba(148,163,184,.2)";   // slate-400 @ 20%
export const axisStroke = "rgba(148,163,184,.6)";
export const tickStyle = { fontSize: 12, fill: axisStroke };

export const numberFmt = (n: number) =>
  n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;

export const priceFmt = (n: number) =>
  n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

export const truncate = (s: string, n = 12) =>
  s.length > n ? s.slice(0, n - 1) + "…" : s;
