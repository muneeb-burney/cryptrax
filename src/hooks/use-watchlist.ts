import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface WatchlistItem {
  id: string;
  cmc_id: number;
  symbol: string;
  name: string;
  slug: string | null;
}

export function useWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["watchlist", user?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<WatchlistItem[]> => {
      const { data, error } = await supabase
        .from("watchlist")
        .select("id, cmc_id, symbol, name, slug")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async (coin: { cmc_id: number; symbol: string; name: string; slug?: string | null }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        cmc_id: coin.cmc_id,
        symbol: coin.symbol,
        name: coin.name,
        slug: coin.slug ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (cmc_id: number) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("watchlist").delete().eq("cmc_id", cmc_id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const ids = new Set((query.data ?? []).map((w) => w.cmc_id));

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    ids,
    add,
    remove,
    isSaved: (cmc_id: number) => ids.has(cmc_id),
  };
}
