import { createServerFn } from "@tanstack/react-start";

export interface Coin {
  id: number;
  rank: number;
  name: string;
  symbol: string;
  slug: string;
  price: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
}

export interface CoinDetail extends Coin {
  description: string | null;
  logo: string | null;
  website: string | null;
  dateAdded: string | null;
  maxSupply: number | null;
  totalSupply: number | null;
}

const CMC_BASE = "https://pro-api.coinmarketcap.com";

function cmcHeaders() {
  const key = process.env.COINMARKETCAP_API_KEY;
  if (!key) throw new Error("Market data is not configured.");
  return {
    "X-CMC_PRO_API_KEY": key,
    Accept: "application/json",
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCoin(item: any): Coin {
  const usd = item.quote?.USD ?? {};
  return {
    id: item.id,
    rank: item.cmc_rank ?? 0,
    name: item.name,
    symbol: item.symbol,
    slug: item.slug ?? "",
    price: usd.price ?? 0,
    percentChange1h: usd.percent_change_1h ?? 0,
    percentChange24h: usd.percent_change_24h ?? 0,
    percentChange7d: usd.percent_change_7d ?? 0,
    marketCap: usd.market_cap ?? 0,
    volume24h: usd.volume_24h ?? 0,
    circulatingSupply: item.circulating_supply ?? 0,
  };
}

export const getListings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Coin[]> => {
    const url = `${CMC_BASE}/v1/cryptocurrency/listings/latest?limit=100&convert=USD`;
    const res = await fetch(url, { headers: cmcHeaders() });
    if (!res.ok) {
      const text = await res.text();
      console.error("CMC listings failed", res.status, text);
      throw new Error("Could not load market data.");
    }
    const json = (await res.json()) as any;
    return (json.data ?? []).map(mapCoin);
  },
);

export const getCoinDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => {
    const id = Number(data?.id);
    if (!Number.isFinite(id) || id <= 0) throw new Error("Invalid coin id.");
    return { id };
  })
  .handler(async ({ data }): Promise<CoinDetail> => {
    const [quoteRes, infoRes] = await Promise.all([
      fetch(
        `${CMC_BASE}/v2/cryptocurrency/quotes/latest?id=${data.id}&convert=USD`,
        { headers: cmcHeaders() },
      ),
      fetch(`${CMC_BASE}/v2/cryptocurrency/info?id=${data.id}`, {
        headers: cmcHeaders(),
      }),
    ]);

    if (!quoteRes.ok) {
      const text = await quoteRes.text();
      console.error("CMC quote failed", quoteRes.status, text);
      throw new Error("Could not load coin data.");
    }

    const quoteJson = (await quoteRes.json()) as any;
    const item = quoteJson.data?.[String(data.id)];
    if (!item) throw new Error("Coin not found.");
    const base = mapCoin(item);

    let info: any = null;
    if (infoRes.ok) {
      const infoJson = (await infoRes.json()) as any;
      info = infoJson.data?.[String(data.id)] ?? null;
    }

    return {
      ...base,
      description: info?.description ?? null,
      logo: info?.logo ?? null,
      website: info?.urls?.website?.[0] ?? null,
      dateAdded: item.date_added ?? null,
      maxSupply: item.max_supply ?? null,
      totalSupply: item.total_supply ?? null,
    };
  });
