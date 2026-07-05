import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Globe } from "lucide-react";
import { getCoinDetail } from "@/lib/market.functions";
import { getCandles, getTicker, timeframeSeconds, type Timeframe } from "@/lib/candles.functions";
import { CandleChart } from "@/components/CandleChart";
import { GlassSegmented } from "@/components/glass/GlassSegmented";
import { GlassToggle } from "@/components/glass/GlassToggle";
import { GlassSlider } from "@/components/glass/GlassSlider";
import { PercentBadge } from "@/components/PercentBadge";
import { WatchButton } from "@/components/WatchButton";
import { formatCompact, formatNumber, formatPrice } from "@/lib/format";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "6h", "1d"];


const detailQuery = (id: number) =>
  queryOptions({
    queryKey: ["coin", id],
    queryFn: () => getCoinDetail({ data: { id } }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const Route = createFileRoute("/coin/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(detailQuery(Number(params.id))),
  head: ({ loaderData }) => {
    const c = loaderData;
    if (!c) return { meta: [{ title: "Coin — GlassCoin" }] };
    const title = `${c.name} (${c.symbol}) Price & Chart — GlassCoin`;
    const desc = `Live ${c.name} price ${formatPrice(c.price)}, ${c.percentChange24h >= 0 ? "up" : "down"} ${Math.abs(c.percentChange24h).toFixed(2)}% today. View candlestick charts and market stats.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(c.logo ? [{ property: "og:image", content: c.logo }] : []),
      ],
    };
  },
  component: CoinDetailPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <p className="text-lg font-semibold">Couldn't load this coin</p>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">
        Back to markets
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">
      Coin not found.
    </div>
  ),
});

function CoinDetailPage() {
  const { id } = Route.useParams();
  const { data: coin } = useQuery(detailQuery(Number(id)));
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [maPeriod, setMaPeriod] = useState(14);

  const symbol = coin?.symbol ?? "";
  const candlesQuery = useQuery({
    queryKey: ["candles", symbol, timeframe],
    enabled: !!symbol,
    queryFn: () => getCandles({ data: { symbol, timeframe } }),
    refetchInterval: timeframe === "1m" ? 15_000 : 60_000,
  });

  const candles = candlesQuery.data?.candles ?? [];
  const pair = candlesQuery.data?.pair ?? null;

  // Live spot price for the current forming candle — polled frequently.
  const tickerQuery = useQuery({
    queryKey: ["ticker", pair],
    enabled: !!pair,
    queryFn: () => getTicker({ data: { pair: pair as string } }),
    refetchInterval: 2500,
  });
  const livePrice = tickerQuery.data?.price ?? null;

  if (!coin) return null;


  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to markets
      </Link>

      {/* Header */}
      <div className="glass mb-6 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {coin.logo && (
            <img src={coin.logo} alt={coin.name} className="h-14 w-14 rounded-2xl" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{coin.name}</h1>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs uppercase text-muted-foreground">
                {coin.symbol}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                Rank #{coin.rank}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold tabular-nums">{formatPrice(coin.price)}</span>
              <PercentBadge value={coin.percentChange24h} />
            </div>
          </div>
        </div>
        <WatchButton coin={coin} size="lg" />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Market cap" value={formatCompact(coin.marketCap)} />
        <Stat label="Volume (24h)" value={formatCompact(coin.volume24h)} />
        <Stat label="Circulating supply" value={`${formatNumber(coin.circulatingSupply)} ${coin.symbol}`} />
        <Stat
          label="Max supply"
          value={coin.maxSupply ? `${formatNumber(coin.maxSupply)} ${coin.symbol}` : "∞"}
        />
      </div>

      {/* Chart */}
      <div className="glass rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Price chart</h2>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {pair ? `${pair} · candlesticks` : "Real-time candlesticks"}
              {livePrice != null && (
                <span className="inline-flex items-center gap-1 text-success">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  live
                </span>
              )}
            </p>
          </div>
          <GlassSegmented
            className="self-start"
            value={timeframe}
            onChange={(tf) => setTimeframe(tf)}
            options={TIMEFRAMES.map((tf) => ({ value: tf, label: tf }))}
          />
        </div>

        {/* Indicator controls — iOS Liquid Glass toggles + slider */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <GlassToggle
              checked={showSMA}
              onChange={setShowSMA}
              label={<span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full" style={{ background: "#e6b450" }} />SMA</span>}
            />
            <GlassToggle
              checked={showEMA}
              onChange={setShowEMA}
              label={<span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full" style={{ background: "#5cc8ff" }} />EMA</span>}
            />
          </div>
          {(showSMA || showEMA) && (
            <GlassSlider
              className="max-w-xs"
              label="MA period"
              value={maPeriod}
              min={2}
              max={100}
              displayValue={maPeriod}
              onChange={setMaPeriod}
            />
          )}
        </div>

        {candlesQuery.isLoading ? (
          <div className="flex h-[420px] items-center justify-center text-muted-foreground">
            Loading chart…
          </div>
        ) : candles.length === 0 ? (
          <div className="flex h-[420px] items-center justify-center text-center text-muted-foreground">
            No candlestick data is available for {coin.symbol}.
          </div>
        ) : (
          <CandleChart
            candles={candles}
            livePrice={livePrice}
            granularity={timeframeSeconds(timeframe)}
            indicators={{ sma: showSMA, ema: showEMA, period: maPeriod }}
          />
        )}
      </div>


      {/* Description */}
      {coin.description && (
        <div className="glass mt-6 rounded-3xl p-6">
          <h2 className="mb-2 text-lg font-semibold">About {coin.name}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{coin.description}</p>
          {coin.website && (
            <a
              href={coin.website}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
              Official website
            </a>
          )}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold tabular-nums">{value}</div>
    </div>
  );
}
