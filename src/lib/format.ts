export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  if (value === 0) return "$0.00";
  const decimals = value >= 1 ? 2 : value >= 0.01 ? 4 : 8;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Manual compact formatting so output is identical on the server (workerd) and
// in the browser. Intl "compact" notation differs between ICU builds, which
// caused SSR/client hydration mismatches (e.g. "$10.60B" vs "$10.6B").
const UNITS: [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

function compact(value: number): string {
  const abs = Math.abs(value);
  for (const [div, suffix] of UNITS) {
    if (abs >= div) {
      const n = value / div;
      return `${n.toFixed(2).replace(/\.?0+$/, "")}${suffix}`;
    }
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "$0";
  return `$${compact(value)}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return compact(value);
}


export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
