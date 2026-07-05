import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { getQuotesByIds } from "@/lib/market.functions";
import { CoinTable } from "@/components/CoinTable";

export const Route = createFileRoute("/_authenticated/watchlist")({
  component: WatchlistPage,
});

function WatchlistPage() {
  const { items, isLoading: watchlistLoading } = useWatchlist();
  const ids = items.map((i) => i.cmc_id);

  const quotes = useQuery({
    ...queryOptions({
      queryKey: ["watchlist-quotes", ids],
      queryFn: () => getQuotesByIds({ data: { ids } }),
      refetchInterval: 60_000,
    }),
    enabled: ids.length > 0,
  });

  const coins = quotes.data ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20">
          <Star className="h-5 w-5 fill-primary text-primary" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "coin" : "coins"} saved
          </p>
        </div>
      </div>

      {watchlistLoading ? (
        <div className="glass rounded-3xl px-5 py-16 text-center text-muted-foreground">
          Loading your watchlist…
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-3xl px-5 py-16 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No coins yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the star on any coin to add it to your watchlist.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg"
          >
            Browse markets
          </Link>
        </div>
      ) : (
        <CoinTable coins={coins} />
      )}
    </main>
  );
}
