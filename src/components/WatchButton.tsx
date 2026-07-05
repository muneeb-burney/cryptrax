import { Star } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";
import type { Coin } from "@/lib/market.functions";

export function WatchButton({
  coin,
  size = "sm",
}: {
  coin: Pick<Coin, "id" | "symbol" | "name" | "slug">;
  size?: "sm" | "lg";
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isSaved, add, remove } = useWatchlist();
  const saved = isSaved(coin.id);
  const busy = add.isPending || remove.isPending;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (saved) {
      remove.mutate(coin.id);
    } else {
      add.mutate({ cmc_id: coin.id, symbol: coin.symbol, name: coin.name, slug: coin.slug });
    }
  };

  if (size === "lg") {
    return (
      <button
        onClick={onClick}
        disabled={busy}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
          saved
            ? "bg-primary/20 text-foreground"
            : "border border-glass-border text-foreground hover:bg-secondary",
        )}
      >
        <Star className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
        {saved ? "In watchlist" : "Add to watchlist"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
    >
      <Star className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
    </button>
  );
}
