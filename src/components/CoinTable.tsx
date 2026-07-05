import { Link } from "@tanstack/react-router";
import { PercentBadge } from "./PercentBadge";
import { WatchButton } from "./WatchButton";
import { formatCompact, formatPrice } from "@/lib/format";
import type { Coin } from "@/lib/market.functions";

export function CoinTable({ coins }: { coins: Coin[] }) {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* Header */}
      <div className="hidden grid-cols-[2.5rem_1.5rem_1fr_8rem_7rem_8rem_8rem] items-center gap-4 border-b border-glass-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span></span>
        <span>#</span>
        <span>Name</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h</span>
        <span className="text-right">Market cap</span>
        <span className="text-right">Volume (24h)</span>
      </div>

      <ul className="divide-y divide-glass-border">
        {coins.map((coin) => (
          <li key={coin.id}>
            <Link
              to="/coin/$id"
              params={{ id: String(coin.id) }}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 md:grid-cols-[2.5rem_1.5rem_1fr_8rem_7rem_8rem_8rem] md:gap-4 md:px-5 md:py-4"
            >
              <WatchButton coin={coin} />

              <span className="hidden text-sm text-muted-foreground tabular-nums md:block">
                {coin.rank}
              </span>

              <div className="min-w-0">
                <div className="truncate font-semibold">{coin.name}</div>
                <div className="text-xs uppercase text-muted-foreground">{coin.symbol}</div>
              </div>

              <span className="text-right font-medium tabular-nums">{formatPrice(coin.price)}</span>

              <span className="text-right">
                <PercentBadge value={coin.percentChange24h} />
              </span>


              <span className="hidden text-right text-sm tabular-nums text-muted-foreground md:block">
                {formatCompact(coin.marketCap)}
              </span>

              <span className="hidden text-right text-sm tabular-nums text-muted-foreground md:block">
                {formatCompact(coin.volume24h)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {coins.length === 0 && (
        <div className="px-5 py-16 text-center text-muted-foreground">No coins found.</div>
      )}
    </div>
  );
}
