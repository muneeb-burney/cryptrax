import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Transfer the server-fetched query cache to the client so SSR and the
    // first client render agree (prevents hydration text mismatches).
    // Cast: the strict serializable validator rejects generic mutation keys,
    // but the payload is JSON-safe at runtime.
    ...({
      dehydrate: () => ({ queryClientState: dehydrate(queryClient) }),
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      hydrate: (d: any) => hydrate(queryClient, d.queryClientState),
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } as any),
  });

  return router;
};
