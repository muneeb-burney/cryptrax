export type Currency = "USD" | "PKR";

// Static display-only conversion rates. No live FX feed — these give a sensible
// approximate value when the user chooses a non-USD display currency.
export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  PKR: 278.5,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  PKR: "₨",
};

export function formatPrice(value: number, currency: Currency = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (!Number.isFinite(value)) return `${symbol}0.00`;
  const v = value * CURRENCY_RATES[currency];
  if (v === 0) return `${symbol}0.00`;
  const decimals = v >= 1 ? 2 : v >= 0.01 ? 4 : 8;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(v);
  return `${symbol}${formatted}`;
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

export function formatCompact(value: number, currency: Currency = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (!Number.isFinite(value) || value === 0) return `${symbol}0`;
  return `${symbol}${compact(value * CURRENCY_RATES[currency])}`;
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
