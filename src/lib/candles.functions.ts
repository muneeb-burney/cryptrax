import { createServerFn } from "@tanstack/react-start";

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = "5s" | "1m" | "5m" | "15m" | "1h" | "5h";

// Map each requested timeframe to a Binance base interval + aggregation group.
// Binance supports 1s/1m/5m/15m/1h natively; 5s and 5h are aggregated.
const TF_MAP: Record<Timeframe, { interval: string; group: number; base: number }> = {
  "5s": { interval: "1s", group: 5, base: 750 },
  "1m": { interval: "1m", group: 1, base: 200 },
  "5m": { interval: "5m", group: 1, base: 200 },
  "15m": { interval: "15m", group: 1, base: 200 },
  "1h": { interval: "1h", group: 1, base: 200 },
  "5h": { interval: "1h", group: 5, base: 600 },
};

const VALID_TF = new Set<string>(Object.keys(TF_MAP));

function aggregate(rows: Candle[], group: number): Candle[] {
  if (group <= 1) return rows;
  const out: Candle[] = [];
  for (let i = 0; i < rows.length; i += group) {
    const chunk = rows.slice(i, i + group);
    if (chunk.length === 0) continue;
    out.push({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((c) => c.high)),
      low: Math.min(...chunk.map((c) => c.low)),
      close: chunk[chunk.length - 1].close,
    });
  }
  return out;
}

export const getCandles = createServerFn({ method: "GET" })
  .inputValidator((data: { symbol: string; timeframe: Timeframe }) => {
    const symbol = String(data?.symbol ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const timeframe = String(data?.timeframe ?? "1h");
    if (!symbol) throw new Error("Missing symbol.");
    if (!VALID_TF.has(timeframe)) throw new Error("Invalid timeframe.");
    return { symbol, timeframe: timeframe as Timeframe };
  })
  .handler(async ({ data }): Promise<{ candles: Candle[]; pair: string | null }> => {
    const cfg = TF_MAP[data.timeframe];
    const pair = `${data.symbol}USDT`;
    const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${cfg.interval}&limit=${cfg.base}`;

    const res = await fetch(url);
    if (!res.ok) {
      // Most likely no USDT spot pair for this asset on Binance.
      console.error("Binance klines failed", pair, res.status);
      return { candles: [], pair: null };
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const rows = (await res.json()) as any[];
    const parsed: Candle[] = rows.map((r) => ({
      time: Math.floor(r[0] / 1000),
      open: parseFloat(r[1]),
      high: parseFloat(r[2]),
      low: parseFloat(r[3]),
      close: parseFloat(r[4]),
    }));

    return { candles: aggregate(parsed, cfg.group), pair };
  });
