import { useState } from "react";
import { cn } from "@/lib/utils";

export function CoinLogo({
  id,
  symbol,
  size = 32,
  className,
}: {
  id: number;
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`;

  if (failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-secondary text-[0.6rem] font-bold uppercase text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {symbol.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${symbol} logo`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
}
