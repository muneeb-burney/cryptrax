import { useEffect, useRef } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import type { Candle } from "@/lib/candles.functions";

export function CandleChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const dataRef = useRef<Candle[]>(candles);
  dataRef.current = candles;

  // Create the chart once, on the client only.
  useEffect(() => {
    let disposed = false;
    let cleanupResize: (() => void) | undefined;

    (async () => {
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");
      if (disposed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
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
        timeScale: { borderColor: "rgba(148, 163, 184, 0.12)", timeVisible: true, secondsVisible: true },
        width: containerRef.current.clientWidth,
        height: 420,
      });

      const series = chart.addCandlestickSeries({
        upColor: "#34d399",
        downColor: "#f43f5e",
        borderUpColor: "#34d399",
        borderDownColor: "#f43f5e",
        wickUpColor: "#34d399",
        wickDownColor: "#f43f5e",
      });

      chartRef.current = chart;
      seriesRef.current = series;

      // Seed with the latest data we have (may have arrived while importing).
      if (dataRef.current.length) {
        series.setData(dataRef.current as never);
        chart.timeScale().fitContent();
      }

      const ro = new ResizeObserver(() => {
        if (containerRef.current) chart.resize(containerRef.current.clientWidth, 420);
      });
      ro.observe(containerRef.current);
      cleanupResize = () => ro.disconnect();
    })();

    return () => {
      disposed = true;
      cleanupResize?.();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data whenever candles change.
  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(candles as never);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return <div ref={containerRef} className="h-[420px] w-full" />;
}
