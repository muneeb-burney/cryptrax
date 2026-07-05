import { createServerFn } from "@tanstack/react-start";

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "6h" | "1d";

// Coinbase Exchange supports these granularities (in seconds) natively.
// Binance is unusable here because it returns HTTP 403 to datacenter/CDN IPs.
const TF_GRANULARITY: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "6h": 21600,
  "1d": 86400,
};

const VALID_TF = new Set<string>(Object.keys(TF_GRANULARITY));

// Some assets quote against USDT/USDC rather than USD on Coinbase.
const QUOTES = ["USD", "USDT", "USDC"];

async function fetchCoinbase(product: string, granularity: number): Promise<Candle[] | null> {
  const url = `https://api.exchange.coinbase.com/products/${product}/candles?granularity=${granularity}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "GlassCoin/1.0", Accept: "application/json" },
  });
  if (!res.ok) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (await res.json()) as any[];
  if (!Array.isArray(rows)) return null;

  // Coinbase returns [ time, low, high, open, close, volume ], newest first.
  const parsed: Candle[] = rows.map((r) => ({
    time: r[0],
    low: r[1],
    high: r[2],
    open: r[3],
    close: r[4],
  }));
  // Chart library needs ascending, de-duplicated time order.
  parsed.sort((a, b) => a.time - b.time);
  return parsed;
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
    const granularity = TF_GRANULARITY[data.timeframe];

    for (const quote of QUOTES) {
      const product = `${data.symbol}-${quote}`;
      const candles = await fetchCoinbase(product, granularity);
      if (candles && candles.length) {
        return { candles, pair: product };
      }
    }

    console.error("No Coinbase market found for", data.symbol);
    return { candles: [], pair: null };
  });
