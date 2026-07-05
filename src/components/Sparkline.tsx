import { useMemo } from "react";
import type { Coin } from "@/lib/market.functions";

/**
 * Builds an approximate 7-day price series from the anchor points we already
 * have (7d / 24h / 1h percent changes + current price). Fully deterministic so
 * server and client render identical markup (no hydration mismatch).
 */
function buildSeries(coin: Pick<Coin, "id" | "price" | "percentChange1h" | "percentChange24h" | "percentChange7d">) {
  const now = coin.price || 1;
  const p7 = now / (1 + coin.percentChange7d / 100);
  const p24 = now / (1 + coin.percentChange24h / 100);
  const p1 = now / (1 + coin.percentChange1h / 100);

  // anchors positioned across a 168h (7 day) window
  const anchors: Array<{ t: number; v: number }> = [
    { t: 0, v: p7 },
    { t: 144, v: p24 },
    { t: 167, v: p1 },
    { t: 168, v: now },
  ];

  const N = 28;
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * 168;
    // find surrounding anchors
    let a = anchors[0];
    let b = anchors[anchors.length - 1];
    for (let j = 0; j < anchors.length - 1; j++) {
      if (t >= anchors[j].t && t <= anchors[j + 1].t) {
        a = anchors[j];
        b = anchors[j + 1];
        break;
      }
    }
    const span = b.t - a.t || 1;
    const base = a.v + ((b.v - a.v) * (t - a.t)) / span;
    // deterministic organic jitter seeded by coin id
    const seed = Math.sin((i + 1) * (coin.id % 97) * 0.7) + Math.cos((i + 1) * 1.3);
    const jitter = base * 0.004 * seed;
    out.push(base + jitter);
  }
  return out;
}

export function Sparkline({
  coin,
  width = 96,
  height = 34,
}: {
  coin: Pick<Coin, "id" | "price" | "percentChange1h" | "percentChange24h" | "percentChange7d">;
  width?: number;
  height?: number;
}) {
  const { path, area, up } = useMemo(() => {
    const series = buildSeries(coin);
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const pad = 3;
    const w = width;
    const h = height;
    const points = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = pad + (h - pad * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });
    const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    return { path, area, up: coin.percentChange7d >= 0 };
  }, [coin, width, height]);

  const stroke = up ? "var(--color-success)" : "var(--color-destructive)";
  const gradId = `spark-${coin.id}-${up ? "u" : "d"}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
