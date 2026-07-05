import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { getListings, type Coin } from "@/lib/market.functions";
import { CoinTable } from "@/components/CoinTable";
import { formatCompact } from "@/lib/format";

const listingsQuery = queryOptions({
  queryKey: ["listings"],
  queryFn: () => getListings(),
  staleTime: 30_000,
  refetchInterval: 60_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQuery),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <p className="text-lg font-semibold">Couldn't load the market</p>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

type SortKey = "rank" | "price" | "change" | "marketCap";

function Dashboard() {
  const { data: coins = [], isFetching, refetch } = useQuery(listingsQuery);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("rank");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = coins;
    if (q) {
      list = coins.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
      );
    }
    const sorters: Record<SortKey, (a: Coin, b: Coin) => number> = {
      rank: (a, b) => a.rank - b.rank,
      price: (a, b) => b.price - a.price,
      change: (a, b) => b.percentChange24h - a.percentChange24h,
      marketCap: (a, b) => b.marketCap - a.marketCap,
    };
    return [...list].sort(sorters[sort]);
  }, [coins, search, sort]);

  const totalCap = coins.reduce((s, c) => s + c.marketCap, 0);
  const totalVol = coins.reduce((s, c) => s + c.volume24h, 0);
  const topGainer = [...coins].sort((a, b) => b.percentChange24h - a.percentChange24h)[0];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The crypto market, crystal clear
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live prices, 24-hour movements, and candlestick charts for the top 100 cryptocurrencies.
          Sign in to build your personal watchlist.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total market cap" value={formatCompact(totalCap)} />
        <StatCard label="24h volume" value={formatCompact(totalVol)} />
        <StatCard
          label="Top gainer (24h)"
          value={topGainer ? `${topGainer.symbol}  ${topGainer.percentChange24h >= 0 ? "+" : ""}${topGainer.percentChange24h.toFixed(1)}%` : "—"}
        />
      </section>

      {/* Controls */}
      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="glass flex flex-1 items-center gap-2 rounded-2xl px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coins by name or symbol…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent text-sm outline-none [&>option]:bg-popover [&>option]:text-popover-foreground"
          >
            <option value="rank">Market rank</option>
            <option value="marketCap">Market cap</option>
            <option value="price">Price</option>
            <option value="change">% change (24h)</option>
          </select>
        </div>

        <button
          onClick={() => refetch()}
          className="glass flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>

      <CoinTable coins={filtered} />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-3xl px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
