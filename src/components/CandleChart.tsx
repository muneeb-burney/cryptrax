import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import type { Candle } from "@/lib/candles.functions";

export interface ChartIndicators {
  sma: boolean;
  ema: boolean;
  period: number;
}

function computeSMA(candles: Candle[], period: number) {
  const out: { time: number; value: number }[] = [];
  if (period < 1) return out;
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period });
  }
  return out;
}

function computeEMA(candles: Candle[], period: number) {
  const out: { time: number; value: number }[] = [];
  if (period < 1 || candles.length < period) return out;
  const k = 2 / (period + 1);
  // seed with SMA of first `period`
  let seed = 0;
  for (let i = 0; i < period; i++) seed += candles[i].close;
  let ema = seed / period;
  out.push({ time: candles[period - 1].time, value: ema });
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    out.push({ time: candles[i].time, value: ema });
  }
  return out;
}

export function CandleChart({
  candles,
  livePrice,
  granularity,
  indicators,
}: {
  candles: Candle[];
  livePrice?: number | null;
  granularity: number;
  indicators: ChartIndicators;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const workingRef = useRef<Candle[]>(candles.slice());
  const prevCloseRef = useRef<number | null>(null);
  const indicatorsRef = useRef(indicators);
  indicatorsRef.current = indicators;

  const [flash, setFlash] = useState<{ dir: "up" | "down"; key: number } | null>(null);

  const refreshIndicators = () => {
    const arr = workingRef.current;
    const p = indicatorsRef.current.period;
    smaRef.current?.setData((indicatorsRef.current.sma ? computeSMA(arr, p) : []) as never);
    emaRef.current?.setData((indicatorsRef.current.ema ? computeEMA(arr, p) : []) as never);
  };

  // Create the chart once, on the client only.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(226, 232, 240, 0.7)",
        fontFamily: "Inter Variable, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.12)" },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.12)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#34d399",
      downColor: "#f43f5e",
      borderUpColor: "#34d399",
      borderDownColor: "#f43f5e",
      wickUpColor: "#34d399",
      wickDownColor: "#f43f5e",
    });

    const sma = chart.addLineSeries({
      color: "#e6b450",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    const ema = chart.addLineSeries({
      color: "#5cc8ff",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    smaRef.current = sma;
    emaRef.current = ema;

    workingRef.current = candles.slice();
    if (workingRef.current.length) {
      series.setData(workingRef.current as never);
      prevCloseRef.current = workingRef.current[workingRef.current.length - 1].close;
      refreshIndicators();
      chart.timeScale().fitContent();
    }

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      smaRef.current = null;
      emaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replace data whenever a fresh historical set arrives (timeframe / symbol change).
  useEffect(() => {
    if (!seriesRef.current) return;
    workingRef.current = candles.slice();
    seriesRef.current.setData(workingRef.current as never);
    prevCloseRef.current = workingRef.current.length
      ? workingRef.current[workingRef.current.length - 1].close
      : null;
    refreshIndicators();
    chartRef.current?.timeScale().fitContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles]);

  // Toggle indicator visibility without a full data reset.
  useEffect(() => {
    refreshIndicators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicators.sma, indicators.ema, indicators.period]);

  // Live tick: mutate the rightmost (forming) candle so it redraws smoothly.
  useEffect(() => {
    const series = seriesRef.current;
    const arr = workingRef.current;
    if (!series || !arr.length || livePrice == null || !Number.isFinite(livePrice)) return;

    const now = Math.floor(Date.now() / 1000);
    const bucket = Math.floor(now / granularity) * granularity;
    const last = arr[arr.length - 1];

    let updated: Candle;
    if (bucket > last.time) {
      updated = { time: bucket, open: livePrice, high: livePrice, low: livePrice, close: livePrice };
      arr.push(updated);
    } else {
      updated = {
        ...last,
        close: livePrice,
        high: Math.max(last.high, livePrice),
        low: Math.min(last.low, livePrice),
      };
      arr[arr.length - 1] = updated;
    }
    series.update(updated as never);
    refreshIndicators();

    const prev = prevCloseRef.current;
    if (prev != null && livePrice !== prev) {
      setFlash({ dir: livePrice > prev ? "up" : "down", key: now * 1000 + (Math.random() * 999 | 0) });
    }
    prevCloseRef.current = livePrice;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice, granularity]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[420px] w-full" />
      {flash && (
        <span
          key={flash.key}
          className={`candle-flash ${flash.dir === "up" ? "flash-up" : "flash-down"}`}
          onAnimationEnd={() => setFlash(null)}
        />
      )}
    </div>
  );
}
